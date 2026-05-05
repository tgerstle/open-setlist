-- Seeding venues...
INSERT OR IGNORE INTO venues (id, name, short_name, theme_color, address, website_url, scraper_type, neighborhood) VALUES
('the-pabst-theater', 'The Pabst Theater', 'Pabst', 'red', '144 E Wells St, Milwaukee, WI 53202', 'https://pabsttheatergroup.com', 'pabst', 'Downtown'),
('the-riverside-theater', 'The Riverside Theater', 'Riverside', 'amber', '116 W Wisconsin Ave, Milwaukee, WI 53203', 'https://pabsttheatergroup.com', 'pabst', 'Downtown'),
('turner-hall-ballroom', 'Turner Hall Ballroom', 'Turner Hall', 'zinc', '1040 N Vel R. Phillips Ave, Milwaukee, WI 53203', 'https://pabsttheatergroup.com', 'pabst', 'Downtown'),
('the-rave-eagles-club', 'The Rave / Eagles Club', 'The Rave', 'yellow', '2401 W Wisconsin Ave, Milwaukee, WI 53233', 'https://therave.com', 'rave', 'Avenues West'),
('cactus-club', 'Cactus Club', 'Cactus Club', 'green', '2496 S Wentworth Ave, Milwaukee, WI 53207', 'https://cactusclubmke.com', 'cactus', 'Bay View'),
('shank-hall', 'Shank Hall', 'Shank Hall', 'cyan', '1434 N Farwell Ave, Milwaukee, WI 53202', 'https://shankhall.com', 'generic', 'Lower East Side'),
('the-cooperage', 'The Cooperage', 'Cooperage', 'sky', '822 S Water St, Milwaukee, WI 53204', 'https://cooperagemke.com', 'generic', 'Walker''s Point'),
('vivarium', 'Vivarium', 'Vivarium', 'lime', '1818 N Farwell Ave, Milwaukee, WI 53202', 'https://pabsttheatergroup.com', 'pabst', 'Lower East Side'),
('x-ray-arcade', 'X-Ray Arcade', 'X-Ray Arcade', 'pink', '5036 S Packard Ave, Cudahy, WI 53110', 'https://xrayarcade.com', 'generic', 'Cudahy'),
('the-jazz-estate', 'The Jazz Estate', 'Jazz Estate', 'purple', '2423 N Murray Ave, Milwaukee, WI 53211', 'https://jazzestate.com', 'generic', 'Upper East Side'),
('mad-planet', 'Mad Planet', 'Mad Planet', 'orange', '533 E Center St, Milwaukee, WI 53212', 'https://mad-planet.net', 'generic', 'Riverwest'),
('linnemans-riverwest-inn', 'Linneman’s Riverwest Inn', 'Linneman''s', 'indigo', '1001 E Locust St, Milwaukee, WI 53212', 'https://linnemans.com', 'generic', 'Riverwest'),
('bremen-cafe', 'Bremen Cafe', 'Bremen Cafe', 'fuchsia', '901 E Clarke St, Milwaukee, WI 53212', 'https://bremencafe.com', 'generic', 'Riverwest'),
('falcon-bowl', 'Falcon Bowl', 'Falcon Bowl', 'emerald', '801 E Clarke St, Milwaukee, WI 53212', 'https://falconbowlmke.com', 'generic', 'Riverwest'),
('miramar-theatre', 'The Miramar Theatre', 'Miramar', 'violet', '2844 N Oakland Ave, Milwaukee, WI 53211', 'https://themiramartheatre.com/', 'miramar', 'Upper East Side');
