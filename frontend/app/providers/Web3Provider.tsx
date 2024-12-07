'use client';

import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { ReactNode, useEffect, useState } from 'react';

function getLibrary(provider: any): ethers.providers.Web3Provider {
    const library = new ethers.providers.Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
}

interface Web3ProviderProps {
    children: ReactNode;
}

export default function Web3Provider({ children }: Web3ProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            {mounted ? children : null}
        </Web3ReactProvider>
    );
} 