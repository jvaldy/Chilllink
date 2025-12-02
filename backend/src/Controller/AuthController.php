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

#[Route('/api')]
final class AuthController extends AbstractController
{
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

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        
        $data = json_decode($request->getContent(), true);


        $email = $data['email'] ?? null;
        $plainPassword = $data['password'] ?? null;

        if (null === $email || null === $plainPassword) {
            return new JsonResponse(
                ['error' => 'Email and password are required.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if ($this->userRepository->findOneBy(['email' => $email])) {
            return new JsonResponse(
                ['error' => 'Email is already used.'],
                Response::HTTP_CONFLICT
            );
        }

        $user = new User();
        $user->setEmail($email);

        $hashedPassword = $this->passwordHasher->hashPassword($user, $plainPassword);
        $user->setPassword($hashedPassword);

        // You may set default roles, e.g. ROLE_USER
        $user->setRoles(['ROLE_USER']);

        // Validate entity
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $validationMessages = [];
            foreach ($errors as $error) {
                $validationMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return new JsonResponse(
                ['errors' => $validationMessages],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(
            ['message' => 'User registered successfully.'],
            Response::HTTP_CREATED
        );
    }



    #[Route('/health', name: 'api_health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        return new JsonResponse(['status' => 'ok'], Response::HTTP_OK);
    }


    // Note: Login is handled by the firewall (json_login) of LexikJWTAuthenticationBundle
    // You don’t need to implement the login action manually if configured correctly.
    // But you can create a route to check token refresh or profile info if needed.
}
