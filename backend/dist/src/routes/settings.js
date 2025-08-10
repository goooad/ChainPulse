"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// 获取设置
router.get('/', async (req, res) => {
    try {
        // 这里应该从数据库获取用户设置
        const settings = {
            riskTolerance: 'MODERATE',
            autoBlock: true,
            requireConfirmation: true,
            transactionFirewall: true,
            nftSentiment: true,
            priceMonitoring: true,
            highRiskTransactions: true,
            sentimentAlerts: true,
            priceAlerts: true,
            emailNotifications: false,
            theme: 'system',
            language: 'zh-CN'
        };
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: '获取设置失败'
        });
    }
});
// 更新设置
router.put('/', async (req, res) => {
    try {
        const settings = req.body;
        // 这里应该保存设置到数据库
        console.log('更新设置:', settings);
        res.json({
            success: true,
            data: settings,
            message: '设置更新成功'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: '更新设置失败'
        });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map