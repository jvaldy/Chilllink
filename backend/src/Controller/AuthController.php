<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use OpenApi\Attributes as OA;

/**
 * AuthController
 * --------------
 * Contrôleur responsable de l’inscription des utilisateurs.
 *
 * Remarque importante :
 * - L’authentification (login) est gérée par LexikJWTAuthenticationBundle
 *   via le firewall Symfony (json_login).
 * - Ce contrôleur se concentre uniquement sur l’inscription.
 */
#[Route('/api')]
final class AuthController extends AbstractController
{
    /**
     * Dépendances injectées via le constructeur
     *
     * - UserRepository            : accès aux utilisateurs existants
     * - EntityManagerInterface    : persistance Doctrine
     * - UserPasswordHasherInterface : hash sécurisé des mots de passe
     * - ValidatorInterface        : validation des contraintes de l’entité User
     */
    private UserRepository $userRepository;
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;

    public function __construct(
        UserRepository $userRepository,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ) {
        $this->userRepository = $userRepository;
        $this->em = $em;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
    }

    /**
     * INSCRIPTION D’UN UTILISATEUR
     * ---------------------------
     * Endpoint public permettant de créer un nouvel utilisateur.
     *
     * URL : POST /api/register
     *
     * Sécurité :
     * - Endpoint volontairement non protégé (pas de JWT requis)
     * - Les validations empêchent les incohérences et doublons
     */
    #[OA\Tag(name: 'Authentification')]
    #[OA\Post(
        path: '/api/register',
        summary: 'Inscription d’un nouvel utilisateur',
        security: [],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(
                        property: 'email',
                        type: 'string',
                        format: 'email',
                        example: 'user@email.com'
                    ),
                    new OA\Property(
                        property: 'password',
                        type: 'string',
                        format: 'password',
                        example: 'password123'
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Utilisateur créé'),
            new OA\Response(response: 400, description: 'Email et mot de passe requis'),
            new OA\Response(response: 409, description: 'Email déjà utilisé'),
            new OA\Response(response: 422, description: 'Erreurs de validation'),
        ]
    )]
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        /**
         * Décodage du JSON envoyé par le client
         */
        $data = json_decode($request->getContent(), true);

        // Récupération des champs requis
        $email = $data['email'] ?? null;
        $plainPassword = $data['password'] ?? null;

        /**
         * Vérification de la présence des champs obligatoires
         */
        if (null === $email || null === $plainPassword) {
            return new JsonResponse(
                ['error' => 'Email and password are required.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        /**
         * Vérification de l’unicité de l’email
         * Empêche la création de comptes en doublon
         */
        if ($this->userRepository->findOneBy(['email' => $email])) {
            return new JsonResponse(
                ['error' => 'Email is already used.'],
                Response::HTTP_CONFLICT
            );
        }

        /**
         * Création de l’entité User
         */
        $user = new User();
        $user->setEmail($email);

        /**
         * Hash sécurisé du mot de passe
         *
         * ⚠️ Le mot de passe en clair n’est jamais stocké
         * Symfony utilise un algorithme moderne (bcrypt / sodium)
         */
        $hashedPassword = $this->passwordHasher->hashPassword($user, $plainPassword);
        $user->setPassword($hashedPassword);

        /**
         * Attribution du rôle par défaut
         */
        $user->setRoles(['ROLE_USER']);

        /**
         * Validation de l’entité User
         * (contraintes définies dans l’entité : email valide, longueur, etc.)
         */
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $validationMessages = [];

            foreach ($errors as $error) {
                $validationMessages[] =
                    $error->getPropertyPath() . ': ' . $error->getMessage();
            }

            return new JsonResponse(
                ['errors' => $validationMessages],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        /**
         * Persistance en base de données
         */
        $this->em->persist($user);
        $this->em->flush();

        /**
         * Réponse finale
         */
        return new JsonResponse(
            ['message' => 'User registered successfully.'],
            Response::HTTP_CREATED
        );
    }

    /**
     * AUTHENTIFICATION (LOGIN)
     * ------------------------
     * ⚠️ Le login n’est PAS implémenté ici.
     *
     * Il est géré par :
     * - LexikJWTAuthenticationBundle
     * - firewall Symfony avec json_login
     *
     * Avantages :
     * - Sécurité éprouvée
     * - Moins de code métier
     * - Meilleure maintenabilité
     *
     * Possibilités futures :
     * - refresh token
     * - logout
     * - invalidation de token
     * - audit de connexions
     */
}
