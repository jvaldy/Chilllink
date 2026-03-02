<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

// Tests d'inscription utilisateur (endpoint public /api/register).
class AuthControllerTest extends WebTestCase
{
    // Cas nominal: un utilisateur peut s'inscrire avec email + mot de passe.
    public function testRegisterSuccess(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'email' => 'testuser@example.com',
            'password' => 'password123'
        ]));
        $this->assertResponseStatusCodeSame(201);
    }

    // Le meme email ne peut pas etre inscrit deux fois.
    public function testRegisterDuplicateEmail(): void
    {
        $client = static::createClient();

        // On reutilise exactement le meme payload pour verifier l'unicite email.
        $payload = json_encode([
            'email' => 'duplicate@example.com',
            'password' => 'password123'
        ]);
        $client->request('POST', '/api/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], $payload);
        $this->assertResponseStatusCodeSame(201);
        $client->request('POST', '/api/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], $payload);
        $this->assertResponseStatusCodeSame(409);
    }

    // L'API rejette une inscription sans les champs requis.
    public function testRegisterMissingFields(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([]));
        $this->assertResponseStatusCodeSame(400);
    }
}

