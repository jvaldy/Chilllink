<?php

use App\Kernel;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

// Force explicitement l'environnement de test.
// Cela evite les ecarts quand le conteneur exporte APP_ENV=dev.
$_SERVER['APP_ENV'] = $_ENV['APP_ENV'] = 'test';
$_SERVER['APP_DEBUG'] = $_ENV['APP_DEBUG'] = $_SERVER['APP_DEBUG'] ?? '1';
putenv('APP_ENV=test');
putenv('APP_DEBUG='.$_SERVER['APP_DEBUG']);

// Charge les variables .env (et .env.test via la resolution Symfony).
if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

// Garde des permissions predictibles pour les fichiers generes en test.
if ((bool) ($_SERVER['APP_DEBUG'] ?? false)) {
    umask(0000);
}

if (($_SERVER['APP_ENV'] ?? null) === 'test') {
    // Demarre un kernel "test" pour reconstruire un schema propre avant la suite.
    // L'objectif est d'avoir une base deterministe quel que soit l'ordre d'execution.
    $kernel = new Kernel('test', (bool) ($_SERVER['APP_DEBUG'] ?? false));
    $kernel->boot();

    $entityManager = $kernel->getContainer()->get('doctrine')->getManager();
    $metadata = $entityManager->getMetadataFactory()->getAllMetadata();

    if ($metadata !== []) {
        $schemaTool = new SchemaTool($entityManager);
        $connection = $entityManager->getConnection();
        $params = $connection->getParams();
        $isSqlite = ($params['driver'] ?? null) === 'pdo_sqlite';

        if ($isSqlite) {
            // Pour SQLite fichier: suppression physique pour repartir de zero.
            // Le dropSchema est moins fiable dans ce contexte (verrous/fichier partage).
            $databasePath = dirname(__DIR__).'/var/test.db';
            if (file_exists($databasePath)) {
                $connection->close();
                @unlink($databasePath);
            }
            $schemaTool->createSchema($metadata);
        } else {
            // Pour les autres SGBD: drop + create du schema de test.
            // Ce chemin est utilise si la suite pointe vers Postgres/MySQL en test.
            $schemaTool->dropSchema($metadata);
            $schemaTool->createSchema($metadata);
        }
    }

    // Nettoie l'EntityManager et ferme le kernel bootstrap.
    $entityManager->clear();
    $kernel->shutdown();
}
