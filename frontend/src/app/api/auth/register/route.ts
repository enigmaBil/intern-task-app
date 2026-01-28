import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // 1. Obtenir un token d'administration Keycloak
    // Utiliser l'URL interne Docker pour les appels serveur
    const keycloakUrl = process.env.BACKEND_KEYCLOAK_ISSUER?.replace('/realms/Mini-Jira-Realm', '') || 'http://keycloak:8080';
    const realm = 'Mini-Jira-Realm';
    
    console.log('[Register] Keycloak config:', {
      keycloakUrl,
      realm,
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      has_secret: !!process.env.KEYCLOAK_CLIENT_SECRET,
    });
    
    // Utiliser le service account du client backend
    // NOTE: Le client mini-jira-backend doit avoir "Service Account Enabled" dans Keycloak
    // et les rôles: manage-users, view-users du client realm-management
    const tokenResponse = await fetch(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID || 'mini-jira-backend',
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get admin token:', await tokenResponse.text());
      return NextResponse.json(
        { error: 'Erreur de configuration du serveur' },
        { status: 500 }
      );
    }

    const { access_token } = await tokenResponse.json();

    // 2. Créer l'utilisateur dans Keycloak
    const createUserResponse = await fetch(`${keycloakUrl}/admin/realms/${realm}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        username: email,
        email: email,
        firstName: firstName,
        lastName: lastName,
        enabled: true,
        emailVerified: false,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      }),
    });

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text();
      console.error('Failed to create user:', errorText);
      
      if (createUserResponse.status === 409) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    // 3. Récupérer l'ID de l'utilisateur créé depuis le header Location
    const locationHeader = createUserResponse.headers.get('Location');
    const userId = locationHeader?.split('/').pop();

    if (!userId) {
      console.error('No user ID returned from Keycloak');
      return NextResponse.json(
        { error: 'Utilisateur créé mais impossible de récupérer son ID' },
        { status: 500 }
      );
    }

    // 4. Assigner le rôle INTERN par défaut
    const rolesResponse = await fetch(`${keycloakUrl}/admin/realms/${realm}/roles/INTERN`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (rolesResponse.ok) {
      const roleData = await rolesResponse.json();
      
      await fetch(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify([roleData]),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      userId: userId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
