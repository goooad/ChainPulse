import { ethers } from 'ethers';
import { TransactionRisk } from '../types';
export declare class FirewallService {
    private provider;
    private isMonitoring;
    constructor();
    startMonitoring(): Promise<void>;
    private startMockMonitoring;
    analyzeTransaction(tx: ethers.TransactionResponse): Promise<TransactionRisk>;
    private checkContractRisk;
    private checkValueRisk;
    private checkGasRisk;
    private checkAddressRisk;
    private checkDataRisk;
    private calculateRiskLevel;
    private getMaliciousContracts;
    private getBlacklistedAddresses;
    private checkContractVerification;
    private getContractAge;
    private sendRiskAlert;
    stopMonitoring(): void;
}
//# sourceMappingURL=FirewallService.d.ts.map