import { useEffect, useRef } from 'react';
import { Browser, OS, System } from '../types/System';

export const useSystem = () => {
  const system = useRef<System>({ os: 'other', browser: 'other' });
  useEffect(() => {
    const ua = window.navigator.userAgent.toLocaleLowerCase();

    const oses: OS[] = ['windows', 'mac', 'linux', 'iphone', 'android'];
    oses.some((os) => {
      if (ua.indexOf(os) === -1) return false;
      system.current.os = os;
      return true;
    });

    const browsers: Browser[] = ['chrome', 'edge', 'firefox', 'opera', 'safari'];
    browsers.some((browser) => {
      if (ua.indexOf(browser) === -1) return false;
      system.current.browser = browser;
      return true;
    });
  }, []);

  return { system };
};
