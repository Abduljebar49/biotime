
export interface SavedShop{
    id: string;
    name: string;
}

export interface SavedBranch{
    id: string;
    name: string;
}

export interface SavedUserRole{
    id: string;
    // roleType: RoleTypes;
    isActive: boolean;
    shop?: SavedShop;
    branch?: SavedBranch;
}

export interface SavedUser{
    id: string;
    email: string;
    fullName: string;
    // hasRole(roleType: RoleTypes): boolean;
    roles?: SavedUserRole[];
    permissions?: any;
}
