import { decryptData } from "./encryption";


export const getPagePermission = async (type) => {
    try {
        const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
        const encrypted = JSON.parse(sessionStorage.getItem("ADMIN-PERMISSION"));
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
