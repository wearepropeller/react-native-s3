import { NativeModules, NativeAppEventEmitter } from "react-native";
import store from "react-native-simple-store";

const { RNS3TransferUtility } = NativeModules;

const transferTypes = ["upload", "download"];
const defaultOptions = {
	region: "eu-west-1"
};
const defaultCognitoOptions = {
	...defaultOptions,
	cognito_region: "eu-west-1"
};
const storeKey = "@_RNS3_Tasks_Extra";
let taskExtras;	// [id]: { bucket, key, state, bytes, totalBytes }
const subscribeCallbacks = {};	// [id]: function

NativeAppEventEmitter.addListener("@_RNS3_Events", async event => {
	if (!taskExtras) await getTaskExtras();
	const { task, /*type, */error } = event;
	const { state, bytes, totalBytes } = task;
	const finalTask = await setTaskExtra(task, { state, bytes, totalBytes });
	if (subscribeCallbacks[task.id]) {
		subscribeCallbacks[task.id](error, finalTask);
	}
});

async function getTaskExtras() {
	taskExtras = await store.get(storeKey) || {};
	return taskExtras;
}

function putExtra(task) {
	if (!taskExtras[task.id]) return task;
	return { ...task, ...taskExtras[task.id] };
}

function saveTaskExtras() {
	return store.save(storeKey, taskExtras);
}

async function setTaskExtra(task, values, isNew) {
	const { id } = task;
	if (!taskExtras[id] || isNew) {
		taskExtras[id] = values;
	} else {
		if (taskExtras[id].bytes && !values.bytes) {
			taskExtras[id] = { ...taskExtras[id], state: values.state };
		} else {
			taskExtras[id] = { ...taskExtras[id], ...values };
		}
	}
	await saveTaskExtras();
	return putExtra(task);
}

class TransferUtility {
	async setupWithNative() {
		RNS3TransferUtility.setupWithNative();
		await getTaskExtras();
		RNS3TransferUtility.initialize();
		return true;
	}

	async setupWithBasic(options = {}) {
		if (!options.access_key || !options.secret_key) {
			return false;
		}
		RNS3TransferUtility.setupWithBasic({ ...defaultOptions, ...options});
		await getTaskExtras();
		RNS3TransferUtility.initialize();
		return true;
	}

	async setupWithCognito(options = {}) {
		if (!options.identity_pool_id) {
			return false;
		}
		RNS3TransferUtility.setupWithCognito({ ...defaultCognitoOptions, ...options});
		await getTaskExtras();
		RNS3TransferUtility.initialize();
		return true;
	}

	async upload(options = {}) {
		if (!options.meta) {
			options.meta = {};
		}
		const task = await RNS3TransferUtility.upload(options);
		const finalTask = await setTaskExtra(task, {
			bucket: options.bucket,
			key: options.key,
			state: task.state
		}, true);
		return finalTask;
	}

	async download(options = {}) {
		const task = await RNS3TransferUtility.download(options);
		const finalTask = await setTaskExtra(task, {
			bucket: options.bucket,
			key: options.key,
			state: task.state
		}, true);
		return finalTask;
	}

	pause(id) {
		RNS3TransferUtility.pause(id);
	}

	resume(id) {
		RNS3TransferUtility.resume(id);
	}

	cancel(id) {
		RNS3TransferUtility.cancel(id);
	}

	async getTask(id) {
		const task = await RNS3TransferUtility.getTask(id);
		if (task) {
			return putExtra(task);
		}
		return null;
	}

	// idAsKey: return Object with id as key
	async getTasks(type = "", idAsKey) {
		if (transferTypes.indexOf(type) > -1) {
			let tasks = await RNS3TransferUtility.getTasks(type);
			tasks = tasks.map(task => putExtra(task));

			if (!idAsKey) return tasks;
			const idAsKeyTasks = {};
			for (const task of tasks) {
				idAsKeyTasks[task.id] = task;
			}
			return idAsKeyTasks;
		}
		return null;
	}

	subscribe(id, eventHandler) {
		if (!taskExtras[id]) return;
		subscribeCallbacks[id] = eventHandler;
	}

	unsubscribe(id) {
		delete subscribeCallbacks[id];
	}
}

export const transferUtility = new TransferUtility();
