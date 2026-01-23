import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'L\'email est requis' },
        { status: 400 }
      );
    }

    // 1. Obtenir un token d'administration Keycloak
    const keycloakUrl = process.env.KEYCLOAK_ISSUER?.replace('/realms/Mini-Jira-Realm', '') || 'http://keycloak:8080';
    const realm = 'Mini-Jira-Realm';
    
    const tokenResponse = await fetch(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.FRONTEND_CLIENT_ID || 'mini-jira-frontend',
        client_secret: process.env.FRONTEND_CLIENT_SECRET || '',
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

    // 2. Rechercher l'utilisateur par email
    const searchResponse = await fetch(
      `${keycloakUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email)}&exact=true`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    );

    if (!searchResponse.ok) {
      console.error('Failed to search user:', await searchResponse.text());
      return NextResponse.json(
        { error: 'Erreur lors de la recherche de l\'utilisateur' },
        { status: 500 }
      );
    }

    const users = await searchResponse.json();

    if (users.length === 0) {
      // Pour la sécurité, on renvoie toujours un succès même si l'email n'existe pas
      // Cela évite de révéler quels emails sont enregistrés
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé',
      });
    }

    const userId = users[0].id;

    // 3. Déclencher l'envoi de l'email de réinitialisation
    const resetResponse = await fetch(
      `${keycloakUrl}/admin/realms/${realm}/users/${userId}/execute-actions-email`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(['UPDATE_PASSWORD']),
      }
    );

    if (!resetResponse.ok) {
      const errorText = await resetResponse.text();
      console.error('Failed to send reset email:', errorText);
      
      // Vérifier si c'est un problème de configuration email
      if (errorText.includes('Failed to send email') || errorText.includes('SMTP')) {
        return NextResponse.json(
          { error: 'Le serveur email n\'est pas configuré. Contactez l\'administrateur.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la demande' },
      { status: 500 }
    );
  }
}
