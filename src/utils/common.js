import { getRequest, postRequest } from 'services/api'; 
import { API_ADMIN_URL } from 'config/constants';
import { notification, Upload } from "antd";
export const getData = async (options) =>{
    try {
        const res = await postRequest(options);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
}

export const addData = async (options) =>{
    try {
        const res = await postRequest(options);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
}

/*********************************************************
* Function Name : List
* Description   : Get list of all common listing
* By            : Afsar Ali
* Date          : 30-03-2024 
*********************************************************/
export const commonList = async (options) =>{
    try {
        const params = {
            url : `${API_ADMIN_URL}common/list`, 
            postData : options
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        console.log(error)
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function

/*********************************************************
* Function Name : serviceList
* Description   : Get list of all service listing
* By            : Afsar Ali
* Date          : 19-04-2024 
*********************************************************/
export const serviceList = async (options) =>{
    try {
        const params = {
            url : `${API_ADMIN_URL}categories/services/list`, 
            postData : options
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        console.log(error)
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function


export const formatedDate = (inputDate) => {
    const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    const date = new Date(inputDate);
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}

export const statusMessage = (status) => {
    try{
        if(status === 'A'){
            return `<p class="text-success" >Active</p>`;
        } else if(status === 'B'){
            return `<p class="text-danger" >Blocked</p>`;
        } else if(status === 'I'){
            return `<p class="text-warning" >Inactive</p>`;
        } else if(status === 'D'){
            return `<p class="text-danger" >Deleted</p>`;
        } else if(status === 'Pending'){
            return `<p class="text-warning" >Pending</p>`;
        } else if(status === 'Processing'){
            return `<p class="text-info" >Processing</p>`;
        } else if(status === 'Completed' || status === 'Complete'){
            return `<p class="text-success" >Completed</p>`;
        } else if(status === 'Reject'){
            return `<p class="text-danger" >Reject</p>`;
        }
    } catch(error) {
        // console.log(error) 
        return '';
    }
}

export const orderStatus = (status) => {
    try{
        if(status === 'Pending'){
            return `<p class="text-warning" >${status}</p>`;
        } else if(status === 'Fail' || status === 'Canceled'){
            return `<p class="text-danger" >${status}</p>`;
        } else if(status === 'Completed'){
            return `<p class="text-success" >${status}</p>`;
        } else if(status === 'Success'){
            return `<p class="text-success" >${status}</p>`;
        } else {
            return `<p class="text-danger" >${status}</p>`;
        }
    } catch(error) {
        // console.log(error) 
        return '';
    }
}

export const bookingStatus = (status) => {
    try{
        if(status === 'Pending'){
            return `<p class="text-warning" >${status}</p>`;
        } else if(status === 'Fail' || status === 'Canceled'){
            return `<p class="text-danger" >${status}</p>`;
        } else if(status === 'Complete' || status === 'Completed'){
            return `<p class="text-success" >${status}</p>`;
        } else {
            return `<p class="text-danger" >${status}</p>`;
        }
    } catch(error) {
        // console.log(error) 
        return '';
    }
}

export const requestStatusMessage = (status) => {
    try{
        if(status === 'P'){
            return `<p class="text-warning" >Pending</p>`;
        } else if(status === 'R'){
            return `<p class="text-danger" >Reject</p>`;
        } else if(status === 'C'){
            return `<p class="text-success" >Complete</p>`;
        } else {
            return `<p class="text-warning" >Procession</p>`;
        }
    } catch(error) {
        return '<p class="text-warning" >Procession</p>';
    }
}

/**
 * Calculate total pages for pagination
 * @param {number} totalCount - Total number of items
 * @param {number} limit - Items per page (default: 10)
 * @returns {number} Total number of pages (minimum 1)
 */
export const getPage = (totalCount = 0, limit = 10) => {
    if (!limit || limit <= 0) limit = 10; // Ensure valid limit
    if (!totalCount || totalCount <= 0) return 1; // Always return at least 1 page
    return Math.max(1, Math.ceil(totalCount / limit));
}

export const authPermission = (permission, path) => {
    try {
      const userData = JSON.parse(sessionStorage.getItem('ADMIN-INFO'));
      if (userData.admin_type === "Super Admin") {
        return true;
      } else {
        const permissionModel = JSON.parse(sessionStorage.getItem('SIDE-MENU'));
        const foundModule = permissionModel.find((module) => {
          const checkModel = path.includes(`${module.moduleName}`);
          if (checkModel) {
            const foundItem = module.firstData.find((item) => path === `/${module.moduleName}-${item.moduleName}`);
            return foundItem && foundItem[permission] === 'Y';
          }
          return false;
        });
        return !!foundModule;
      }
    } catch (error) {
    //   console.error('Error checking permissions:', error);
      return false;
    }
};
/***** This function is used for generate random coloe ******* */
export const  getRandomColor=()=> {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
} //End of function
/**** This function is used for generate Letter profile image **** */
export const createImageFromInitials = (size, name, color) => {
    if (name == null) return;
    name=getInitials(name)

    const canvas=document.createElement('canvas')
    const context=canvas.getContext('2d')
    canvas.width=canvas.height=size

    context.beginPath();
    context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    context.closePath();
    context.clip();

    context.fillStyle="#ffffff"
    context.fillRect(0,0,size,size)

    context.fillStyle=`${color}50`
    context.fillRect(0,0,size,size)

    context.fillStyle=color;
    context.textBaseline='middle'
    context.textAlign='center'
    context.font =`${size/2}px Roboto`
    context.fillText(name,(size/2),(size/2))

    return canvas.toDataURL()
};

const getInitials = (name) => {
    let initials;
    const nameSplit = name.split(" ");
    const nameLength = nameSplit.length;
    if (nameLength > 1) {
        initials =
            nameSplit[0].substring(0, 1) +
            nameSplit[nameLength - 1].substring(0, 1);
    } else if (nameLength === 1) {
        initials = nameSplit[0].substring(0, 1);
    } else return;

    return initials.toUpperCase();
};

export const ucfirst = (str) => {
    try{
        return str.charAt(0).toUpperCase() + str.slice(1);
    }catch (error){
        return str;
    }
}

/*********************************************************
 *  This function is use to validate image format file should be jpg/jpeg/png
 *********************************************************/
export const beforeUpload = async (file) => {
    try {
      const isJpgOrPng =
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png";
  
      if (!isJpgOrPng) {
        notification.error({
          message: "Invalid file type",
          description: "You can only upload JPG/JPEG/PNG file!",
          placement: "topRight",
        });
        throw new Error("Invalid file type");
      }
  
      return isJpgOrPng;
    } catch (error) {
      console.error("Error in beforeUpload:", error);
      return Upload.LIST_IGNORE;
    }
  };
/*********************************************************
 *  This function is use to validate image format file should be jpg/jpeg/png
 *********************************************************/
export const createSlug = async (input = '') => {
    return input
      .toString()                    // Convert to string
      .toLowerCase()                 // Convert to lowercase
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/[^\w-]+/g, '')       // Remove non-word characters (excluding hyphens)
      .replace(/--+/g, '-')         // Replace multiple hyphens with a single hyphen
      +`-${Date.now()}`                   // milisecond time for generate unique 
}

/*********************************************************
 *  This function is use to validate image format file should be jpg/jpeg/png
 *********************************************************/
export const calculateAge = (input) => {
    const birthDate = new Date(input);
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDay() - birthDate.getDay();
    if (months < 0) {
        years--;
        months += 12
    }
    if(years > 0){
        return `<span>${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}</span>`;
    } else if(months > 0){
        return `<span>${months} month${months > 1 ? 's' : ''}</span>`;
    } else {
        return `<span>${days} day${days > 1 ? 's' : ''}</span>`;
    }
}

export const getRelativeTime = (dueDate='') => {
    try {
        if(!dueDate || dueDate === ''){
            return "-";
        } else{
            const now = new Date();
            const due = new Date(dueDate);
          
            now.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);
          
            const diffInMs = due - now;
            const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
          
            if (diffInDays === 0) {
              return `<span>Today</span>`;
            } else if (diffInDays > 0) {
              return `<span>in ${diffInDays} day${diffInDays > 1 ? "s" : ""}</span>`;
            } else {
              return `<span>${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? "s" : ""} ago</span>`;
            }
        }
    } catch (error) {
        return "-"
    }
  };

  /**
 * Check Number value
 * @param {Number} value - Number value
 * @param {Number} defaultValue - Default value
 */
  export const checkNumberValue = (value, defaultValue) => {
    return isNaN(value) ? (defaultValue || value) : Number(value);
}
export const formatProjectDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bahrain', // time zone for dubai
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

export const maskPhone = (phone, visibleFromEnd = 4, maskChar = "*") => {
  if (!phone || typeof phone !== "string") return phone;

  const digits = [];
  for (let i = 0; i < phone.length; i++) {
    if (/\d/.test(phone[i])) digits.push(i);
  }
  if (digits.length === 0) return phone;

  const result = phone.split("");
  const startMaskIndex = Math.max(0, digits.length - visibleFromEnd);

  for (let di = 0; di < digits.length; di++) {
    const pos = digits[di];
    if (di < startMaskIndex) result[pos] = maskChar;
  }
  return result.join("");
}

export const maskEmail = (email, maskChar = "*") => {
  if (!email || typeof email !== "string") return email;
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  // local part
  let maskedLocal;
  if (local.length <= 2) {
    maskedLocal = local[0] + maskChar;
  } else {
    maskedLocal =
      local[0] + maskChar.repeat(local.length - 2) + local[local.length - 1];
  }

  // domain part (mask inner chars of first label, keep TLD as-is)
  const labels = domain.split(".");
  if (labels.length > 1) {
    for (let i = 0; i < labels.length - 1; i++) {
      const lbl = labels[i];
      if (lbl.length > 2) {
        labels[i] =
          lbl[0] +
          maskChar.repeat(lbl.length - 2) +
          lbl[lbl.length - 1];
      } else if (lbl.length === 2) {
        labels[i] = lbl[0] + maskChar;
      }
    }
  }
  const maskedDomain = labels.join(".");

  return `${maskedLocal}@${maskedDomain}`;
}