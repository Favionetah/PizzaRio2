const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // Add lat column
        try {
            await db.query('ALTER TABLE tsucursales ADD COLUMN lat DECIMAL(10, 8)');
            console.log('Added lat column');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('lat column already exists');
            } else {
                throw e;
            }
        }

        // Add lng column
        try {
            await db.query('ALTER TABLE tsucursales ADD COLUMN lng DECIMAL(11, 8)');
            console.log('Added lng column');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('lng column already exists');
            } else {
                throw e;
            }
        }

        // Update existing branch
        await db.query("UPDATE tsucursales SET lat = -17.7833, lng = -63.1821 WHERE idSucursal = 'SC-01'");
        console.log('Updated SC-01 coordinates');

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
