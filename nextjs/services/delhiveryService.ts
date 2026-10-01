export const delhiveryService = {
    async getShipments(): Promise<any[]> {
        return [];
    },
    async createShipment(order: unknown): Promise<{ success: boolean; order: unknown; awb: string }> {
        return { success: true, order, awb: `GUNA-${Date.now()}` };
    },
};
