import { NativeModules, DeviceEventEmitter } from "react-native";
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
let taskExtras;	// [id]: { bucket, key, bytes }
const subscribeCallbacks = {};	// [id]: function

DeviceEventEmitter.addListener("@_RNS3_Events", async event => {
	if (!taskExtras) await getTaskExtras();
	const { task, error } = event;
	const { bytes } = task;
	const finalTask = await setTaskExtra(task, { bytes });
	if (subscribeCallbacks[task.id]) {
		subscribeCallbacks[task.id](error, task);
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
		if (values.bytes) {
			taskExtras[id] = { ...taskExtras[id], ...values };
		}
	}
	await saveTaskExtras();
	return putExtra(task);
}

class TransferUtility {
	async setupWithNative() {
		const result = await RNS3TransferUtility.setupWithNative();
		if (result) {
			await getTaskExtras();
			RNS3TransferUtility.initializeRNS3();
		}
		return result;
	}

	async setupWithBasic(options = {}) {
		if (!options.access_key || !options.secret_key) {
			return false;
		}
		if (!options.session_token) {
			options.session_token = null;
		}
		const result = await RNS3TransferUtility.setupWithBasic({ ...defaultOptions, ...options });
		if (result) {
			await getTaskExtras();
			RNS3TransferUtility.initializeRNS3();
		}
		return result;
	}

	async setupWithCognito(options = {}) {
		if (!options.identity_pool_id) {
			return false;
		}
		if (!options.caching) {
			options.caching = false;
		}
		const result = await RNS3TransferUtility.setupWithCognito({ ...defaultCognitoOptions, ...options });
		if (result) {
			await getTaskExtras();
			RNS3TransferUtility.initializeRNS3();
		}
		return result;
	}

	async upload(options = {}) {
		if (!options.meta) {
			options.meta = {};
		}
		const task = await RNS3TransferUtility.upload(options);
		const finalTask = await setTaskExtra(task, {
			bucket: options.bucket,
			key: options.key
		}, true);
		return task;
	}

	async download(options = {}) {
		const task = await RNS3TransferUtility.download(options);
		const finalTask = await setTaskExtra(task, {
			bucket: options.bucket,
			key: options.key
		}, true);
		return task;
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

	async deleteRecord(id) {
		return RNS3TransferUtility.deleteRecord(id);
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
