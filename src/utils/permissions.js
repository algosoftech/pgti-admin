import { decryptData } from "./encryption";
import { getAdminStorageItem } from "./adminAuthStorage";


export const getPagePermission = async (type) => {
    try {
        const user = JSON.parse(getAdminStorageItem("ADMIN-INFO"));
        const encrypted = JSON.parse(getAdminStorageItem("ADMIN-PERMISSION"));
        const decrypted = await decryptData(encrypted);
        const permissions = JSON.parse(decrypted); 
        return {
            fullAccess : user?.admin_type === "Super Admin"?'Y':'N', 
            ...permissions[type]
        };
    } catch (error) {
        return false;
    }
};
