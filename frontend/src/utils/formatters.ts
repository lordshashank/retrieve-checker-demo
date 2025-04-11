import CID from "cids";

export const formatBytes = (bytes: bigint) => {
  const sizes = ["bytes", "KB", "MB", "GB", "TB"];
  if (bytes === BigInt(0)) return "0 bytes";

  const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024));
  const value = Number(bytes) / Math.pow(1024, i);

  return `${value.toFixed(2)} ${sizes[i]}`;
};

export const hexToString = (hex: string) => {
  // Remove 0x prefix if present
  hex = hex.replace("0x", "");

  try {
    // Convert hex to ASCII by taking pairs of characters and converting to characters
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  } catch (error) {
    return hex; // Return original hex if conversion fails
  }
};

export const formatBigNumberHex = (hex: string) => {
  if (!hex || hex === "0x") return "0";

  try {
    // Remove 0x prefix if present
    hex = hex.replace("0x", "");
    // Convert hex to decimal
    const decimal = BigInt("0x" + hex);
    // Format with commas for readability
    return decimal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } catch (error) {
    return "0";
  }
};

export const hexToPieceCID = (hex: string) => {
  try {
    // Remove 0x prefix if present
    hex = hex.startsWith("0x") ? hex.slice(4) : hex;
    const buf = Buffer.from(hex, 'hex');
    const cid = new CID(buf);
    const cidStr = cid.toString(); // Convert CID to string representation
    
    return cidStr;
  } catch (error) {
    console.error("Error converting hex to CID:", error);
    console.error("Hex value:", hex);
    
    return "Invalid CID";
  }
};
