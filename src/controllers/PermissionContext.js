import React, { createContext, useContext, useEffect, useState } from "react";
import { decryptData } from "./Encryption";

// Context
const PermissionContext = createContext(undefined);
export { PermissionContext };

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState({});
    const [fullAccess, setFullAccess] = useState("N");

    const fetchPermissions = async () => {
        try {
            const userRaw = sessionStorage.getItem("ADMIN-INFO");
            const encryptedRaw = sessionStorage.getItem("ADMIN-PERMISSION");

            const user = userRaw ? JSON.parse(userRaw) : null;
            const encrypted = encryptedRaw ? JSON.parse(encryptedRaw) : null;

            if (encrypted) {
                const decrypted = await decryptData(encrypted);
                const parsedPermissions = JSON.parse(decrypted);
                if(parsedPermissions && parsedPermissions?.length > 0){
                    const updatedPermissions = {};
                    parsedPermissions.forEach((item)=>{
                        const moduleName = item.module;
                        const parsedPerm = JSON.parse(item.permissions_json || "{}");

                        if (!updatedPermissions[moduleName]) {
                            updatedPermissions[moduleName] = {};
                        }

                        updatedPermissions[moduleName] = {
                            ...updatedPermissions[moduleName],
                            ...parsedPerm,
                        };
                    });
                    setPermissions(updatedPermissions);
                } else{
                    setPermissions({});    
                }
            } else {
                setPermissions({});
            }

            setFullAccess(user?.admin_type === "Super Admin" ? "Y" : "N");
        } catch (error) {
            console.error("Error fetching permissions:", error);
            setPermissions({});
            setFullAccess("N");
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    // Expose refetchPermissions to context consumers
    const refetchPermissions = fetchPermissions;

    return (
        <PermissionContext.Provider value={{ fullAccess, permissions, refetchPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = (type) => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error("usePermissions must be used within a PermissionProvider");
    }

    const { fullAccess, permissions } = context;

    if (type === "FULL") {
        return { fullAccess, permissions };
    } else {
        return { fullAccess, ...permissions?.[type] };
    }
};
