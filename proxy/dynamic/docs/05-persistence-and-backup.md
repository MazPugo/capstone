# Phase 5 — Persistence & Backup Plan

## 1. What needs to persist

For The EpicBook, all important state lives in the MySQL database:

- **Customer-visible data**: books, authors, carts, checkout data.
- **Schema and relationships**: managed by Sequelize migrations.

The Docker Compose stack persists database state using a **named volume**:

- Volume name: `db_data`
- Mounted into the MySQL container at: `/var/lib/mysql`
- Defined in `docker-compose.yml` under:

  - `services.db.volumes` → `db_data:/var/lib/mysql`
  - `volumes` → `db_data:`

The application does **not** write uploads or generated assets to the filesystem (no user-uploaded images or files), so there is no separate `app_data` volume required.

## 2. Persistence behaviour (compose-level)

Because the `db_data` volume is named and **not** removed on a normal restart, the data survives:

- `docker-compose down` / `up`
- Container recreation (e.g. rebuilding the backend image)
- Traefik / backend restarts and healthcheck failures

Only a destructive action such as removing the volume (`down -v`) or deleting the VM disk would wipe data.

I validated this by:

- Starting the stack, seeding several books into the `epicbook` database.
- Stopping and starting the stack multiple times.
- Confirming that the same books still appeared in the UI after each restart.

## 3. Backup strategy

### 3.1 What to back up

The backup plan focuses on **logical backups** of the database plus optional infrastructure snapshots:

- **Primary backup artifact**: SQL dump of the `epicbook` database (schema + data).
- **Optional**: snapshot of the `db_data` volume or whole VM disk for quick full recovery.

Because all important business data lives in MySQL, backing up the database is sufficient for data recovery.

### 3.2 When to back up

Proposed schedule:

- **Daily**: automated database dump of the `epicbook` database.
- **Weekly**: infrastructure-level snapshot (for example, an EC2 volume snapshot of the VM’s disk or the Docker volume).

The exact tooling (cron, systemd timer, CI job, or managed backup service) can be chosen later. The important part is that **at least one daily logical backup** exists and is stored outside the MySQL container.

### 3.3 Where to store backups

Backups should be stored somewhere separate from the running MySQL container:

- **Primary location**: a backup directory on the VM (for example `/backups`), owned by the VM user and not mounted into any container.
- **Recommended secondary location**: a remote object store such as:
  - AWS S3 bucket
  - Azure Blob Storage

The daily routine can copy the latest SQL dump from the local `/backups` directory to remote storage so that data survives even if the VM is lost.

## 4. Backup/restore procedure (conceptual)

### 4.1 Backup workflow

1. Connect to the MySQL server from the VM or from inside the `db` container.
2. Generate a logical SQL dump of the `epicbook` database (schema + data).
3. Save the `.sql` file into a backup directory on the VM (e.g., `/backups/epicbook-<date>.sql`).
4. Optionally copy the file to object storage (S3/Azure Blob) for off-VM retention.

Key characteristics:

- A **logical dump** is portable between MySQL versions.
- You can restore to a fresh MySQL instance in a different environment if needed.

### 4.2 Restore workflow

To restore from a backup:

1. Ensure the EpicBook stack is stopped or at least that the application is not actively writing to the database.
2. Create a fresh `epicbook` database (or drop and recreate the existing one) inside MySQL.
3. Import the chosen `.sql` backup file into the database.
4. Start (or restart) the Docker Compose stack so the backend reconnects to the restored database.
5. Verify via the UI and SQL queries that:
   - Tables exist.
   - Books and other records match the state at the time of the backup.

This workflow can be used for both **point-in-time recovery** (using the most recent dump) and **rollback** (using an older dump).

## 5. Manual backup/restore test (evidence)

To validate that the persistence and backup approach works, I performed a manual backup and restore test:

1. **Baseline state**  
   - Started the stack.
   - Confirmed the `epicbook` database existed.
   - Inserted several sample book records and verified they appeared in The EpicBook UI.

2. **Backup**  
   - Generated a logical SQL dump of the `epicbook` database and stored it on the VM in a backup directory.
   - Took a screenshot of the UI showing the list of books *before* any destructive changes.

3. **Simulated data loss / change**  
   - Modified the data (for example, removed one of the books or cleared the `Book` table).
   - Verified that the change was visible in the UI (book gone or list empty).
   - Captured a “broken state” screenshot.

4. **Restore**  
   - Restored the `epicbook` database from the previously created SQL dump.
   - Restarted the EpicBook stack so the backend reconnected to MySQL.
   - Confirmed that the previously deleted/changed book records were back and visible in the UI.
   - Captured an “after restore” screenshot showing that the data had been successfully recovered.

### 5.1 Result

The test showed that:

- The named volume `db_data` provides persistence across normal container restarts.
- A logical SQL dump is sufficient to fully recreate the EpicBook database.
- Restoring from a dump returns the application to a known good state, which satisfies the capstone requirement of testing the backup/restore plan at least once.
