import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
	initializeFirestore,
	persistentLocalCache,
	persistentMultipleTabManager
} from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

const app = initializeApp(firebaseConfig);

const acquireAuth = () => {
	console.log("Initializing Auth...");
	return getAuth(app);
};

const auth = acquireAuth();

const acquireFirestore = () => {
	console.log("Initializing Firestore...");
	return initializeFirestore(app, {
		localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
	});
};
const db = acquireFirestore();

export { auth, db };
