import { exit, stdin, stdout } from 'process'
import * as readline from 'readline/promises'
import { SlowDb } from './utils/database.js'

async function main(): Promise<void> {

	console.log(`\n\n\n\t\t${"Taskish".toUpperCase()}\n\n`)
	console.log("1. List Tasks")
	console.log("2. Exit")

	const rl = readline.createInterface({
		input: stdin,
		output: stdout
	})

	const option = await rl.question('What would you like to do?: ')

	console.log("Hello World")
	switch (option) {
		case '1':
			get_tasks()
			await main()
		case '2':
			exit(0)
		default:
			exit(0)
	}
}


function get_tasks() {
	const slowdb = new SlowDb('db.json')
	const tasks = slowdb.read()
	console.log(tasks)
}

while (true) {
	await main()
}
