'use client';

import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { ReactNode } from 'react';

function getLibrary(provider: any): ethers.providers.Web3Provider {
    const library = new ethers.providers.Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
}

interface Web3ProviderProps {
    children: ReactNode;
}

export default function Web3Provider({ children }: Web3ProviderProps) {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            {children}
        </Web3ReactProvider>
    );
} 