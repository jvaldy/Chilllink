<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\RegisterUserRequest;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
final class AuthController extends AbstractController
{
    // Dépendances principales
    private UserRepository $userRepository;
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;

    // Injection des services
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

    #[OA\Tag(name: 'Authentication')]
    #[OA\Post(
        path: '/api/register',
        summary: 'Register a new user',
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
            new OA\Response(response: 201, description: 'User created'),
            new OA\Response(response: 400, description: 'Email and password are required'),
            new OA\Response(response: 409, description: 'Email already used'),
            new OA\Response(response: 422, description: 'Validation errors'),
        ]
    )]
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    // Inscription d'un nouvel utilisateur
    public function register(Request $request): JsonResponse
    {
        // Lecture du JSON d'entrée
        $data = json_decode($request->getContent(), true) ?? [];
        $dto = RegisterUserRequest::fromArray($data);

        // Vérification minimale des champs
        if ($dto->email === '' || $dto->password === '') {
            return new JsonResponse(
                ['error' => 'Email and password are required.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Validation DTO
        $errors = $this->validator->validate($dto);
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

        // Contrôle d'unicité de l'email
        if ($this->userRepository->findOneBy(['email' => $dto->email])) {
            return new JsonResponse(
                ['error' => 'Email is already used.'],
                Response::HTTP_CONFLICT
            );
        }

        // Création de l'utilisateur
        $user = new User();
        $user->setEmail($dto->email);

        // Hash du mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $dto->password);
        $user->setPassword($hashedPassword);
        $user->setRoles(['ROLE_USER']);

        // Validation de l'entité
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

        // Persistance en base
        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(
            ['message' => 'User registered successfully.'],
            Response::HTTP_CREATED
        );
    }
}
