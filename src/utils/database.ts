import fs from 'fs'
import path from 'path';
import { URL } from 'url';
import CryptoJS from 'crypto-js';

type Record = {
	_id: string,
	_created: Date,
	_updated: Date,
	_data: Object

}

export class SlowDb {

	private db: string
	private __dirname: string = new URL('.', import.meta.url).pathname
	constructor(file_name: string) {
		this.db = this.setup_db(file_name)
	}

	/*
	 * Description: helper function to setup database or to find the database
	 * params: file_name the name of the database file
	 * returns: the path to the database file
	 */
	private setup_db(file_name: string): string {
		const db_path = path.join(this.__dirname, `.${file_name}`)
		if (fs.existsSync(db_path)) {
			return db_path
		} else {
			const fd: number = fs.openSync(db_path, 'w')
			fs.close(fd)
			return db_path
		}
	}

	write(data: Object): void {
		try {
			const id = this.create_id(data)
			const record: Record = {
				_id: id,
				_created: new Date(),
				_updated: new Date(),
				_data: data
			}
			fs.appendFileSync(this.db, `${JSON.stringify(record)}\n`)
		} catch (err) {
			console.error(err)
		}
	}

	read(): Object[] {
		try {
			const lines = this.get_lines()
			return this.lines_to_data_objects(lines)
		} catch (err) {
			console.error(err)
		}
	}


	update(newData: Object) {
		try {
			const lines = this.get_lines()
			const records = this.lines_to_records(lines)
			var record_id = null
			var created_date = null
			const hashedValues = Object.values(newData).flatMap((value) => {
				return CryptoJS.SHA512(value).toString()
			})
			for (let i = 0; i < records.length; i++) {
				for (let value of hashedValues) {
					if (records[i]._id.includes(value)) {
						record_id = records[i]._id
						created_date = records[i]._created
						records.splice(i, 1)
						break;
					}
				}
			}
			records.push({ _id: record_id, _created: created_date, _updated: new Date(), _data: newData })
			this.overwrite(records)
		} catch (error) {
			console.error(error)
		}
	}


	delete(record: Object) {
		try {
			const lines = this.get_lines()
			const records = this.lines_to_records(lines)
			const hashedValues = Object.values(record).flatMap((value) => {
				return CryptoJS.SHA512(value).toString()
			})
			for (let i = 0; i < records.length; i++) {
				for (let value of hashedValues) {
					if (records[i]._id.includes(value)) {
						records.splice(i, 1)
						break;
					}
				}
			}

			this.overwrite(records)
		} catch (error) {
			console.error(error)
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

	private get_lines(): string[] {
		const lines = fs.readFileSync(this.db).toString().split('\n')
		return lines.slice(0, lines.length - 1)
	}

	private lines_to_data_objects(lines: string[]): Object[] {
		var objects = []
		lines.forEach((line) => {
			objects.push(JSON.parse(line)._data)
		})
		return objects
	}


	private lines_to_records(lines: string[]): Record[] {
		var objects = []
		lines.forEach((line) => {
			objects.push(JSON.parse(line))
		})
		return objects
	}


	private create_id(data: Object): string {
		var id: string = '';
		const values = Object.values(data)
		values.forEach((value) => {
			id += this.hash(value)
		})
		return id
	}

	private hash(value: string | Object): string {
		return CryptoJS.SHA512(value.toString()).toString()
	}


	private overwrite(records: Record[]) {
		try {
			const fd: number = fs.openSync(this.db, "w")
			fs.closeSync(fd)
			records.forEach((record) => {
				fs.appendFileSync(this.db, `${JSON.stringify(record)}\n`)
			})
		} catch (err) {
			console.error(err)
		}
	}


}


