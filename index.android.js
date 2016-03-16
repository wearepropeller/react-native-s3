import { NativeModules, DeviceEventEmitter } from "react-native";

const { RNS3TransferUtility } = NativeModules;

const transferTypes = ["upload", "download"];
const defaultOptions = {
	region: "eu-west-1"
};
const defaultCognitoOptions = {
	...defaultOptions,
	cognito_region: "eu-west-1"
};
const subscribeCallbacks = {};	// [id]: function

DeviceEventEmitter.addListener("@_RNS3_Events", event => {
	const { task, error } = event;
	if (subscribeCallbacks[task.id]) {
		subscribeCallbacks[task.id](error, task);
	}
});

class TransferUtility {
	async setupWithNative() {
		const result = await RNS3TransferUtility.setupWithNative();
		if (result) {
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
			RNS3TransferUtility.initializeRNS3();
		}
		return result;
	}

	async upload(options = {}) {
		if (!options.meta) {
			options.meta = {};
		}
		const task = await RNS3TransferUtility.upload(options);

		return task;
	}

	async download(options = {}) {
		const task = await RNS3TransferUtility.download(options);

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
		return RNS3TransferUtility.getTask(id);
	}

	// idAsKey: return Object with id as key
	async getTasks(type = "", idAsKey) {
		if (transferTypes.indexOf(type) > -1) {
			const tasks = await RNS3TransferUtility.getTasks(type);
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
		subscribeCallbacks[id] = eventHandler;
	}

	unsubscribe(id) {
		delete subscribeCallbacks[id];
	}
}

export const transferUtility = new TransferUtility();
