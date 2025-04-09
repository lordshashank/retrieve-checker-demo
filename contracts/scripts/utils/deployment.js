const fs = require('fs');
const path = require('path');

// Directory where deployment info will be stored
const DEPLOYMENTS_DIR = path.join(__dirname, '../../deployments');

/**
 * Save contract address for a network
 * @param {string} networkName - Name of the network (e.g., 'calibration', 'mainnet')
 * @param {object} addresses - Object containing contract names and their addresses
 */
function saveDeploymentInfo(networkName, addresses) {
    // Create deployments directory if it doesn't exist
    if (!fs.existsSync(DEPLOYMENTS_DIR)) {
        fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
    }

    const deploymentPath = path.join(DEPLOYMENTS_DIR, `${networkName}.json`);
    
    // Load existing addresses if any
    let existingAddresses = {};
    if (fs.existsSync(deploymentPath)) {
        existingAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    }

    // Update with new addresses
    const updatedAddresses = { ...existingAddresses, ...addresses };
    
    // Save updated addresses
    fs.writeFileSync(
        deploymentPath,
        JSON.stringify(updatedAddresses, null, 2)
    );

    console.log(`Contract addresses updated for network: ${networkName}`);
}

/**
 * Get deployed contract address for a network
 * @param {string} networkName - Name of the network
 * @param {string} [contractName] - Optional contract name to get specific address
 * @returns {object|string|null} - Returns addresses object or specific contract address
 */
function getLatestDeployment(networkName, contractName = null) {
    try {
        const deploymentPath = path.join(DEPLOYMENTS_DIR, `${networkName}.json`);
        if (!fs.existsSync(deploymentPath)) {
            return null;
        }

        const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        
        if (contractName) {
            return addresses[contractName] || null;
        }
        
        return addresses;
    } catch (error) {
        console.error('Error reading deployment info:', error);
        return null;
    }
}

module.exports = {
    saveDeploymentInfo,
    getLatestDeployment
};