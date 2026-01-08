-- Kindr Baby Name App - Seed Data
-- Brazilian names sourced from IBGE (Brazilian Institute of Geography and Statistics)
-- Data aggregated from multiple decades (2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930)
-- Generated: 2026-01-08T23:10:47.068Z
--
-- Source: https://servicodados.ibge.gov.br/api/v2/censos/nomes
-- Documentation: https://servicodados.ibge.gov.br/api/docs/nomes
--
-- Notes:
-- - Names are sorted by highest frequency across all decades
-- - Each name shows its peak registration count
-- - Total unique names fetched: 131
-- - Top 77 female and 54 male names included

-- ============================================
-- BRAZILIAN NAMES - Female
-- ============================================

INSERT INTO names (name, gender, country, origin, meaning, popularity_rank, registration_count) VALUES
('Maria', 'F', 'BR', 'Hebrew', 'Wished-for child, bitter', 1, 2488835),
('Ana', 'F', 'BR', 'Hebrew', 'Grace, favor', 2, 931115),
('Jessica', 'F', 'BR', 'Hebrew', 'God beholds', 3, 344929),
('Vitoria', 'F', 'BR', 'Latin', 'Victory', 4, 282734),
('Julia', 'F', 'BR', 'Latin', 'Youthful, soft-haired', 5, 264647),
('Adriana', 'F', 'BR', 'Latin', 'From Hadria', 6, 246444),
('Bruna', 'F', 'BR', 'German', 'Brown-haired', 7, 242543),
('Juliana', 'F', 'BR', 'Latin', 'Youthful', 8, 228462),
('Aline', 'F', 'BR', 'French', 'Noble', 9, 210918),
('Leticia', 'F', 'BR', 'Latin', 'Joy, happiness', 10, 208527),
('Amanda', 'F', 'BR', 'Latin', 'Worthy of love', 11, 208444),
('Patricia', 'F', 'BR', 'Latin', 'Noble', 12, 207130),
('Camila', 'F', 'BR', 'Latin', 'Young ceremonial attendant', 13, 205029),
('Marcia', 'F', 'BR', 'Latin', 'Warlike', 14, 204014),
('Fernanda', 'F', 'BR', 'German', 'Adventurous, daring traveler', 15, 189019),
('Vanessa', 'F', 'BR', 'Greek', 'Butterfly', 16, 178488),
('Sandra', 'F', 'BR', 'Greek', 'Defender of mankind', 17, 177434),
('Luciana', 'U', 'BR', 'Portuguese', '', 18, 174334),
('Beatriz', 'F', 'BR', 'Latin', 'She who brings happiness', 19, 170464),
('Larissa', 'F', 'BR', 'Greek', 'Cheerful', 20, 168755),
('Gabriela', 'F', 'BR', 'Hebrew', 'God is my strength', 21, 168390),
('Luana', 'F', 'BR', 'Hawaiian', 'Content, happy', 22, 165569),
('Claudia', 'U', 'BR', 'Portuguese', '', 23, 153752),
('Natalia', 'F', 'BR', 'Latin', 'Christmas day', 24, 147659),
('Cristiane', 'U', 'BR', 'Portuguese', '', 25, 143484),
('Mariana', 'F', 'BR', 'Hebrew/Latin', 'Star of the sea', 26, 142606),
('Simone', 'U', 'BR', 'Portuguese', '', 27, 142582),
('Fabiana', 'U', 'BR', 'Portuguese', '', 28, 142240),
('Renata', 'U', 'BR', 'Portuguese', '', 29, 139045),
('Francisca', 'F', 'BR', 'Latin', 'Free one', 30, 129893),
('Isabela', 'F', 'BR', 'Hebrew', 'Devoted to God', 31, 126158),
('Vera', 'U', 'BR', 'Portuguese', '', 32, 126099),
('Sonia', 'U', 'BR', 'Portuguese', '', 33, 125000),
('Daiane', 'U', 'BR', 'Portuguese', '', 34, 121597),
('Andreia', 'U', 'BR', 'Portuguese', '', 35, 117478),
('Rafaela', 'F', 'BR', 'Hebrew', 'God has healed', 36, 116301),
('Sara', 'F', 'BR', 'Hebrew', 'Princess', 37, 115760),
('Jaqueline', 'U', 'BR', 'Portuguese', '', 38, 113696),
('Eliane', 'U', 'BR', 'Portuguese', '', 39, 112720),
('Daniela', 'U', 'BR', 'Portuguese', '', 40, 112553),
('Priscila', 'U', 'BR', 'Portuguese', '', 41, 110973),
('Eduarda', 'F', 'BR', 'English', 'Wealthy guardian', 42, 110144),
('Bianca', 'F', 'BR', 'Italian', 'White, pure', 43, 108866),
('Rosangela', 'F', 'BR', 'Latin', 'Rose angel', 44, 108739),
('Tatiane', 'U', 'BR', 'Portuguese', '', 45, 107903),
('Carla', 'U', 'BR', 'Portuguese', '', 46, 107261),
('Geovana', 'F', 'BR', 'Italian', 'God is gracious', 47, 104253),
('Antonia', 'U', 'BR', 'Portuguese', '', 48, 104239),
('Rita', 'U', 'BR', 'Portuguese', '', 49, 95631),
('Lucia', 'U', 'BR', 'Portuguese', '', 50, 91840),
('Marlene', 'U', 'BR', 'Portuguese', '', 51, 91531),
('Andrea', 'U', 'BR', 'Portuguese', '', 52, 87730),
('Silvana', 'U', 'BR', 'Portuguese', '', 53, 85056),
('Terezinha', 'U', 'BR', 'Portuguese', '', 54, 84680),
('Aparecida', 'U', 'BR', 'Portuguese', '', 55, 81510),
('Alessandra', 'U', 'BR', 'Portuguese', '', 56, 81350),
('Elaine', 'U', 'BR', 'Portuguese', '', 57, 78925),
('Sueli', 'U', 'BR', 'Portuguese', '', 58, 77956),
('Marli', 'U', 'BR', 'Portuguese', '', 59, 71895),
('Regina', 'U', 'BR', 'Portuguese', '', 60, 71376),
('Rosa', 'U', 'BR', 'Portuguese', '', 61, 70866),
('Josefa', 'U', 'BR', 'Portuguese', '', 62, 70275),
('Fatima', 'U', 'BR', 'Portuguese', '', 63, 69450),
('Tania', 'U', 'BR', 'Portuguese', '', 64, 67970),
('Raimunda', 'U', 'BR', 'Portuguese', '', 65, 59007),
('Luzia', 'U', 'BR', 'Portuguese', '', 66, 56920),
('Tereza', 'U', 'BR', 'Portuguese', '', 67, 54579),
('Joana', 'U', 'BR', 'Portuguese', '', 68, 31703),
('Helena', 'F', 'BR', 'Greek', 'Shining light, torch', 69, 31056),
('Benedita', 'U', 'BR', 'Portuguese', '', 70, 29409),
('Nair', 'U', 'BR', 'Portuguese', '', 71, 27943),
('Sebastiana', 'U', 'BR', 'Portuguese', '', 72, 27799),
('Elza', 'U', 'BR', 'Portuguese', '', 73, 27470),
('Luiza', 'F', 'BR', 'German', 'Famous warrior', 74, 16900),
('Alice', 'F', 'BR', 'German', 'Noble, of noble lineage', 75, 16121),
('Isabel', 'U', 'BR', 'Portuguese', '', 76, 8798),
('Alzira', 'U', 'BR', 'Portuguese', '', 77, 8098);

-- ============================================
-- BRAZILIAN NAMES - Male
-- ============================================

INSERT INTO names (name, gender, country, origin, meaning, popularity_rank, registration_count) VALUES
('Jose', 'M', 'BR', 'Hebrew', 'God will increase', 1, 1239593),
('Joao', 'M', 'BR', 'Hebrew', 'God is gracious', 2, 787738),
('Gabriel', 'M', 'BR', 'Hebrew', 'God is my strength', 3, 577365),
('Antonio', 'M', 'BR', 'Latin', 'Priceless', 4, 530320),
('Lucas', 'M', 'BR', 'Greek', 'Light-giving', 5, 513021),
('Pedro', 'M', 'BR', 'Greek', 'Stone, rock', 6, 439612),
('Francisco', 'M', 'BR', 'Latin', 'Free one', 7, 330798),
('Mateus', 'M', 'BR', 'Hebrew', 'Gift of God', 8, 327290),
('Rafael', 'M', 'BR', 'Hebrew', 'God has healed', 9, 312180),
('Gustavo', 'M', 'BR', 'Swedish', 'Staff of the gods', 10, 302475),
('Bruno', 'M', 'BR', 'German', 'Brown', 11, 289349),
('Guilherme', 'M', 'BR', 'German', 'Resolute protector', 12, 276608),
('Paulo', 'M', 'BR', 'Latin', 'Small, humble', 13, 274120),
('Carlos', 'M', 'BR', 'German', 'Free man', 14, 269761),
('Felipe', 'M', 'BR', 'Greek', 'Lover of horses', 15, 261272),
('Marcos', 'M', 'BR', 'Latin', 'Dedicated to Mars', 16, 255601),
('Rodrigo', 'M', 'BR', 'Germanic', 'Famous ruler', 17, 249274),
('Vitor', 'M', 'BR', 'Latin', 'Victor, winner', 18, 242220),
('Fabio', 'U', 'BR', 'Portuguese', '', 19, 235431),
('Marcelo', 'M', 'BR', 'Latin', 'Young warrior', 20, 224408),
('Leandro', 'M', 'BR', 'Greek', 'Lion man', 21, 223381),
('Leonardo', 'M', 'BR', 'German', 'Brave lion', 22, 209134),
('Tiago', 'U', 'BR', 'Portuguese', '', 23, 201378),
('Luiz', 'M', 'BR', 'German', 'Famous warrior', 24, 197923),
('Daniel', 'M', 'BR', 'Hebrew', 'God is my judge', 25, 192619),
('Andre', 'M', 'BR', 'Greek', 'Manly', 26, 190123),
('Eduardo', 'M', 'BR', 'English', 'Wealthy guardian', 27, 190054),
('Matheus', 'M', 'BR', 'Hebrew', 'Gift of God', 28, 188689),
('Luis', 'M', 'BR', 'German', 'Famous warrior', 29, 183425),
('Marcio', 'U', 'BR', 'Portuguese', '', 30, 180126),
('Anderson', 'M', 'BR', 'English', 'Son of Andrew', 31, 179572),
('Diego', 'M', 'BR', 'Spanish', 'Supplanter', 32, 177665),
('Fernando', 'M', 'BR', 'German', 'Adventurous', 33, 167744),
('Alexandre', 'M', 'BR', 'Greek', 'Defender of mankind', 34, 145239),
('Raimundo', 'U', 'BR', 'Portuguese', '', 35, 134739),
('Luciano', 'U', 'BR', 'Portuguese', '', 36, 125953),
('Ricardo', 'M', 'BR', 'German', 'Strong ruler', 37, 120118),
('Claudio', 'U', 'BR', 'Portuguese', '', 38, 119866),
('Manoel', 'U', 'BR', 'Portuguese', '', 39, 115900),
('Jorge', 'U', 'BR', 'Portuguese', '', 40, 112865),
('Sebastiao', 'U', 'BR', 'Portuguese', '', 41, 112504),
('Edson', 'U', 'BR', 'Portuguese', '', 42, 111230),
('Roberto', 'U', 'BR', 'Portuguese', '', 43, 107991),
('Sergio', 'U', 'BR', 'Portuguese', '', 44, 107342),
('Geraldo', 'U', 'BR', 'Portuguese', '', 45, 86727),
('Benedito', 'U', 'BR', 'Portuguese', '', 46, 54313),
('Mario', 'U', 'BR', 'Portuguese', '', 47, 50343),
('Manuel', 'U', 'BR', 'Portuguese', '', 48, 49572),
('Joaquim', 'U', 'BR', 'Portuguese', '', 49, 45780),
('Nelson', 'U', 'BR', 'Portuguese', '', 50, 32043),
('Severino', 'U', 'BR', 'Portuguese', '', 51, 29702),
('Osvaldo', 'U', 'BR', 'Portuguese', '', 52, 14763),
('Vicente', 'U', 'BR', 'Portuguese', '', 53, 5834),
('Miguel', 'M', 'BR', 'Hebrew', 'Who is like God?', 54, 5315);

-- ============================================
-- US NAMES
-- ============================================
-- US name data can be added here
-- Source: Social Security Administration (SSA)
-- https://www.ssa.gov/oact/babynames/
