import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
export class FirebaseEventLogger {
    static analytics: any;

    static init() {
        const firebaseConfig = {
            apiKey: 'AIzaSyB1MXxH8cM-PytUzKS7UOKQydteoxyhdRc',
            authDomain: 'bubbo-bubbo.firebaseapp.com',
            projectId: 'bubbo-bubbo',
            storageBucket: 'bubbo-bubbo.appspot.com',
            messagingSenderId: '21228150538',
            appId: '1:21228150538:web:121f4b08dcd90b30bb64f3',
            measurementId: 'G-TV5CN4M4N4',
        };
        initializeApp(firebaseConfig);
        this.analytics = getAnalytics();
    }

    static log(eventName: string, eventParams?: { [key: string]: any }): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (!DEV_MODE) {
            logEvent(this.analytics, eventName, eventParams);
        }
        console.log(`Event logged: ${eventName}`, eventParams);
    }
}
