import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// If the project is the user's custom personal project, we use the default database "(default)"
const useDefaultDb = firebaseConfig.projectId === 'law-platform-1dd66' || !firebaseConfig.firestoreDatabaseId;
export const db = useDefaultDb 
  ? getFirestore(app) 
  : getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: Client is offline.");
    } else {
      console.log("Firebase integration is up and running.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

type DbErrorCallback = (error: string, path: string | null, operation: OperationType) => void;
let dbErrorCallback: DbErrorCallback | null = null;

export function onDatabaseError(callback: DbErrorCallback) {
  dbErrorCallback = callback;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errorMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  if (dbErrorCallback) {
    dbErrorCallback(errorMsg, path, operationType);
  }

  // Only throw for write operations (CREATE, UPDATE, DELETE, WRITE) to let UI forms catch and display them.
  // Do NOT throw for GET/LIST operations as they run on boot/snapshots and would crash the whole React tree.
  if (operationType !== OperationType.GET && operationType !== OperationType.LIST) {
    throw new Error(JSON.stringify(errInfo));
  }
}
