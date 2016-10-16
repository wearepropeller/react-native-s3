import React, { Component } from "react";
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableHighlight
} from "react-native";
import { transferUtility } from "react-native-s3";
import fs from "react-native-fs";

console.log(fs.DocumentDirectoryPath);

const bucketName = "";
const uploadFileKey = "test.mp4";
const contentType = "image/jpeg";
const uploadFilePath = fs.DocumentDirectoryPath + "/test.mp4";
const downloadFileKey = "test.mp4";
const downloadFilePath = fs.DocumentDirectoryPath + "/test_download.mp4";

const sampleVideoURL = "http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 20,
		backgroundColor: "#F5FCFF"
	},
	title: {
		fontSize: 20,
		textAlign: "center",
		margin: 10
	},
	task: {
		flexDirection: "row",
		justifyContent: "center"
	},
	text: {
		fontSize: 12,
		textAlign: "center",
		margin: 10
	},
	btn: {
		fontSize: 15,
		textAlign: "center",
		margin: 10
	}
});

class S3Sample extends Component {
	constructor(props) {
		super(props);

		this.state = {
			initLoaded: false
		};
	}

	async componentDidMount() {
		if (!this.state.initLoaded) {
			if (!await fs.exists(uploadFilePath)) {
				await fs.downloadFile(sampleVideoURL, uploadFilePath);
			}
			await transferUtility.setupWithNative();
			// await transferUtility.enableProgressSent(false);

			const uploadTasks = await transferUtility.getTasks("upload", true);
			const downloadTasks = await transferUtility.getTasks("download", true);

			for (const id in uploadTasks) {
				this.subscribeWithUpdateState(id, "uploadTasks");
			}
			for (const id in downloadTasks) {
				this.subscribeWithUpdateState(id, "downloadTasks");
			}

			this.setState({ initLoaded: true, uploadTasks, downloadTasks });
		}
	}

	subscribeWithUpdateState = (id, typeKey) => {
		transferUtility.subscribe(id, (err, task) => {
			if (err) task.errMessage = err;
			this.setState({
				[typeKey]: {
					...this.state[typeKey],
					...{ [task.id]: task }
				}
			});
		});
	};

	handleUploadFile = async () => {
		const task = await transferUtility.upload({
			bucket: bucketName,
			key: uploadFileKey,
			file: uploadFilePath,
			meta: {
				'Content-Type': contentType
			}
		});
		this.setState({
			uploadTasks: {
				...this.state.uploadTasks,
				...{ [task.id]: task }
			}
		});
		this.subscribeWithUpdateState(task.id, "uploadTasks");
	};

	handleDownloadFile = async () => {
		const task = await transferUtility.download({
			bucket: bucketName,
			key: downloadFileKey,
			file: downloadFilePath
		});
		this.setState({
			downloadTasks: {
				...this.state.downloadTasks,
				...{ [task.id]: task }
			}
		});
		this.subscribeWithUpdateState(task.id, "downloadTasks");
	};

	pauseTask(id) {
		transferUtility.pause(id);
	}

	cancelTask(id) {
		transferUtility.cancel(id);
	}

	// Android only
/*	removeTask(id) {
		transferUtility.deleteRecord(id);
		this.setState({
			[typeKey]: {
				...this.state[typeKey],
				...{ [task.id]: undefined }
			}
		});
	}*/

	resumeTask(id) {
		transferUtility.resume(id);
	}

	renderTasks(tasks) {
		return Object.keys(tasks).map(id => {
			let progress;
			if (tasks[id].totalBytes) {
				progress = <Text style={styles.text}>{(tasks[id].bytes / tasks[id].totalBytes) * 100 + "%"}</Text>;
			}
			return (
				<View
					key={id}
					style={styles.task}
				>
					<Text style={styles.text}>{id}</Text>
					<Text style={styles.text}>{tasks[id].state}</Text>
					{progress}
				</View>
			);
		});
	}

	renderUploadTask() {
		const { uploadTasks } = this.state;
		return (
			<View>
				<Text style={styles.title}>{"Upload Tasks"}</Text>
				{this.renderTasks(uploadTasks)}
				<TouchableHighlight onPress={this.handleUploadFile}>
					<Text style={styles.btn}>{"New Upload"}</Text>
				</TouchableHighlight>
			</View>
		);
	}

	renderDownloadTask() {
		const { downloadTasks } = this.state;
		return (
			<View>
				<Text style={styles.title}>{"Download Tasks"}</Text>
				{this.renderTasks(downloadTasks)}
				<TouchableHighlight onPress={this.handleDownloadFile}>
					<Text style={styles.btn}>{"New Download"}</Text>
				</TouchableHighlight>
			</View>
		);
	}

	renderLoading() {
		return (
			<View>
				<Text style={styles.title}>{"Loading..."}</Text>
			</View>
		);
	}

	render() {
		return (
			<View style={styles.container}>
				<ScrollView>
					{
						(() => {
							if (!this.state.initLoaded) {
								return this.renderLoading();
							} else {
								return (
									<View>
										{this.renderUploadTask()}
										{this.renderDownloadTask()}
									</View>
								);
							}
						})()
					}
				</ScrollView>
			</View>
		);
	}
}

AppRegistry.registerComponent("S3Sample", () => S3Sample);
