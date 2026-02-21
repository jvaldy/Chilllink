<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260220083437 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE user_profile_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE user_profile (id INT NOT NULL, user_id INT NOT NULL, first_name VARCHAR(100) DEFAULT NULL, last_name VARCHAR(100) DEFAULT NULL, birth_date DATE DEFAULT NULL, phone_number VARCHAR(50) DEFAULT NULL, city VARCHAR(100) DEFAULT NULL, country VARCHAR(100) DEFAULT NULL, bio TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D95AB405A76ED395 ON user_profile (user_id)');
        $this->addSql('COMMENT ON COLUMN user_profile.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN user_profile.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE user_profile ADD CONSTRAINT FK_D95AB405A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE user_profile_id_seq CASCADE');
        $this->addSql('ALTER TABLE user_profile DROP CONSTRAINT FK_D95AB405A76ED395');
        $this->addSql('DROP TABLE user_profile');
    }
}
