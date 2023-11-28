import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import CryptoJS from 'crypto-js';
export class SlowDb {
    constructor(file_name) {
        this.__dirname = new URL('.', import.meta.url).pathname;
        this.db = this.setup_db(file_name);
    }
    /*
     * Description: helper function to setup database or to find the database
     * params: file_name the name of the database file
     * returns: the path to the database file
     */
    setup_db(file_name) {
        const db_path = path.join(this.__dirname, `.${file_name}`);
        if (fs.existsSync(db_path)) {
            return db_path;
        }
        else {
            const fd = fs.openSync(db_path, 'w');
            fs.close(fd);
            return db_path;
        }
    }
    write(data) {
        try {
            const id = this.create_id(data);
            const record = {
                _id: id,
                _created: new Date(),
                _updated: new Date(),
                _data: data
            };
            fs.appendFileSync(this.db, `${JSON.stringify(record)}\n`);
        }
        catch (err) {
            console.error(err);
        }
    }
    read() {
        try {
            const lines = this.get_lines();
            return this.lines_to_data_objects(lines);
        }
        catch (err) {
            console.error(err);
        }
    }
    update(newData) {
        try {
            const lines = this.get_lines();
            const records = this.lines_to_records(lines);
            var record_id = null;
            var created_date = null;
            const hashedValues = Object.values(newData).flatMap((value) => {
                return CryptoJS.SHA512(value).toString();
            });
            for (let i = 0; i < records.length; i++) {
                for (let value of hashedValues) {
                    if (records[i]._id.includes(value)) {
                        record_id = records[i]._id;
                        created_date = records[i]._created;
                        records.splice(i, 1);
                        break;
                    }
                }
            }
            records.push({ _id: record_id, _created: created_date, _updated: new Date(), _data: newData });
            this.overwrite(records);
        }
        catch (error) {
            console.error(error);
        }
    }
    delete(record) {
        try {
            const lines = this.get_lines();
            const records = this.lines_to_records(lines);
            const hashedValues = Object.values(record).flatMap((value) => {
                return CryptoJS.SHA512(value).toString();
            });
            for (let i = 0; i < records.length; i++) {
                for (let value of hashedValues) {
                    if (records[i]._id.includes(value)) {
                        records.splice(i, 1);
                        break;
                    }
                }
            }
            this.overwrite(records);
        }
        catch (error) {
            console.error(error);
        }
    }
    // private find(data: Object): Record | null {
    // 	try {
    // 		const lines = this.get_lines()
    // 		const records = this.lines_to_records(lines)
    // 		const hashedValues = Object.values(data).flatMap((value) => {
    // 			return CryptoJS.SHA512(value).toString()
    // 		})
    // 		for (let record of records) {
    // 			hashedValues.forEach((value) => {
    // 				if (record._id.includes(value)) {
    // 					return record
    // 				}
    // 				return null
    // 			})
    // 		}
    // 		return null
    // 	} catch (err) {
    // 		console.error(err)
    // 	}
    // }
    get_lines() {
        const lines = fs.readFileSync(this.db).toString().split('\n');
        return lines.slice(0, lines.length - 1);
    }
    lines_to_data_objects(lines) {
        var objects = [];
        lines.forEach((line) => {
            objects.push(JSON.parse(line)._data);
        });
        return objects;
    }
    lines_to_records(lines) {
        var objects = [];
        lines.forEach((line) => {
            objects.push(JSON.parse(line));
        });
        return objects;
    }
    create_id(data) {
        var id = '';
        const values = Object.values(data);
        values.forEach((value) => {
            id += this.hash(value);
        });
        return id;
    }
    hash(value) {
        return CryptoJS.SHA512(value.toString()).toString();
    }
    overwrite(records) {
        try {
            const fd = fs.openSync(this.db, "w");
            fs.closeSync(fd);
            records.forEach((record) => {
                fs.appendFileSync(this.db, `${JSON.stringify(record)}\n`);
            });
        }
        catch (err) {
            console.error(err);
        }
    }
}
//# sourceMappingURL=database.js.map