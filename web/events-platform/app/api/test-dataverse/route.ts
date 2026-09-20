export async function GET() {
    // Get a token using the client credentials flow
    const tokenResponse = await fetch(
        `https://login.microsoftonline.com/${process.env.DATAVERSE_TENANT_ID}/oauth2/v2.0/token`,
        {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.DATAVERSE_CLIENT_ID!,
                client_secret: process.env.DATAVERSE_CLIENT_SECRET!,
                scope: `${process.env.DATAVERSE_URL}/.default`,
            }),
        }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
        return Response.json({ step: "token", error: tokenData}, {status: 500});
    }

    // Use the token to call the Dataverse web API
    const dataverseResponse = await fetch(
        `${process.env.DATAVERSE_URL}/api/data/v9.2/contacts?$top=1&$select=fullname`,
        {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
            }
        }
    );

    const dataverseData = await dataverseResponse.json();

    if (!dataverseResponse.ok) {
        return Response.json({ step: "dataverse", error: dataverseData}, {status: 500});
    }

    return Response.json({ success: true, contacts: dataverseData.value });
}