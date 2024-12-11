# Keycloak Setup Guide

This guide provides step-by-step instructions for setting up Keycloak for your project.

## Steps

### 1. Login to Keycloak

- Navigate to the Keycloak Admin Console at `http://<keycloak-server>/auth/admin/`.
- Enter your admin credentials to log in.

### 2. Create a Realm

- Click on "Add Realm" in the admin console.
- Enter the realm name as **`wallet-realm`** and save.

### 3. Create a Client

- Navigate to **`wallet-realm`**.
- Go to the "Clients" section.
- Click "Create" and enter the client name as **`wallet-app`**.
- For "Web Origins", enter the domain name of the frontend app or use `*` for testing purposes.

### 4. Create a User

- Navigate to the "Users" section within **`wallet-realm`**.
- Click "Add User" and fill in all the user fields.
- Ensure "Email Verified" is enabled.

### 5. Set User Credentials

- Under the "Credentials" tab for the user, create a password.
- Uncheck the "Temporary" option to make the password permanent.

### 6. Configure the Client

- Go to the **`wallet-app`** client under the "Clients" section.
- Enable "Client Authentication" under the "Capability Config" section and save.

### 7. Retrieve Client Secret

- A new tab named "Credentials" will appear.
- Set the environment variable `KC_CLIENT_ID` with this value.

### 8. Obtain the Realm Public Key

- Under "Realm Settings" for **`wallet-realm`**, navigate to the "Keys" tab.
- Copy the RS256 Public Key.
- Set the environment variable `KC_REALM_PUBLIC_KEY` with this value.

## Additional Notes

- Ensure that all configurations are saved after each step.
- For production environments, replace `*` in "Web Origins" with the actual domain name of your frontend application.
- Regularly update your Keycloak version to benefit from security patches and new features.

For more detailed information, refer to the [Keycloak Documentation](https://www.keycloak.org/documentation).