import admin from 'firebase-admin';
export function firebaseAdmin(){if(!admin.apps.length){const raw=process.env.FIREBASE_SERVICE_ACCOUNT;if(!raw)throw new Error('FIREBASE_SERVICE_ACCOUNT não configurada.');admin.initializeApp({credential:admin.credential.cert(JSON.parse(raw))});}return admin;}
export function nexumHeaders(){const chatId=process.env.NEXUM_CHAT_ID,credential=process.env.NEXUM_API_CREDENTIAL;if(!chatId||!credential)throw new Error('Credenciais Nexum ausentes.');return {'Content-Type':'application/json','X-API-Chat-Id':chatId,'X-API-Credential':credential};}
export function paidStatus(s){return ['PAID','APPROVED','COMPLETED','SUCCESS','CONFIRMED','COMPLETO'].includes(String(s||'').toUpperCase());}
