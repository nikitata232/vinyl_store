--
-- PostgreSQL database dump
--

\restrict EWKmx2aQpqDf9D1Dro30hgrGArxGDYOxd7KHOLrxtlp2hilwzvo1uqCyR79sGT2

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: albums; Type: TABLE; Schema: public; Owner: nikitatata
--

CREATE TABLE public.albums (
    album_id integer NOT NULL,
    album_name character varying(255) NOT NULL,
    artist_id integer,
    genre_id integer,
    release_year integer,
    price numeric(10,2)
);


ALTER TABLE public.albums OWNER TO nikitatata;

--
-- Name: albums_album_id_seq; Type: SEQUENCE; Schema: public; Owner: nikitatata
--

CREATE SEQUENCE public.albums_album_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.albums_album_id_seq OWNER TO nikitatata;

--
-- Name: albums_album_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nikitatata
--

ALTER SEQUENCE public.albums_album_id_seq OWNED BY public.albums.album_id;


--
-- Name: artists; Type: TABLE; Schema: public; Owner: nikitatata
--

CREATE TABLE public.artists (
    artist_id integer NOT NULL,
    artist_name character varying(100) NOT NULL,
    artist_country character varying(100)
);


ALTER TABLE public.artists OWNER TO nikitatata;

--
-- Name: artists_artist_id_seq; Type: SEQUENCE; Schema: public; Owner: nikitatata
--

CREATE SEQUENCE public.artists_artist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.artists_artist_id_seq OWNER TO nikitatata;

--
-- Name: artists_artist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nikitatata
--

ALTER SEQUENCE public.artists_artist_id_seq OWNED BY public.artists.artist_id;


--
-- Name: genres; Type: TABLE; Schema: public; Owner: nikitatata
--

CREATE TABLE public.genres (
    genre_id integer NOT NULL,
    genre_name character varying(100) NOT NULL
);


ALTER TABLE public.genres OWNER TO nikitatata;

--
-- Name: genres_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: nikitatata
--

CREATE SEQUENCE public.genres_genre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.genres_genre_id_seq OWNER TO nikitatata;

--
-- Name: genres_genre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nikitatata
--

ALTER SEQUENCE public.genres_genre_id_seq OWNED BY public.genres.genre_id;


--
-- Name: albums album_id; Type: DEFAULT; Schema: public; Owner: nikitatata
--

ALTER TABLE ONLY public.albums ALTER COLUMN album_id SET DEFAULT nextval('public.albums_album_id_seq'::regclass);


--
-- Name: artists artist_id; Type: DEFAULT; Schema: public; Owner: nikitatata
--

ALTER TABLE ONLY public.artists ALTER COLUMN artist_id SET DEFAULT nextval('public.artists_artist_id_seq'::regclass);


--
-- Name: genres genre_id; Type: DEFAULT; Schema: public; Owner: nikitatata
--

ALTER TABLE ONLY public.genres ALTER COLUMN genre_id SET DEFAULT nextval('public.genres_genre_id_seq'::regclass);


--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: nikitatata
--

COPY public.albums (album_id, album_name, artist_id, genre_id, release_year, price) FROM stdin;
1	Good Kid, M.A.A.D City	1	7	2012	5990.00
2	Damn.	1	1	2017	5990.00
3	To Pimp a Butterfly	1	6	2015	5490.00
4	Man on the Moon: The End of Day	2	6	2009	5990.00
5	Take Care	3	1	2011	5490.00
6	Barter 6	4	2	2015	5490.00
7	LIVE.LOVE.A$AP	5	5	2011	5490.00
8	LONG.LIVE.A$AP	5	5	2013	5490.00
9	MONKEY BUSINESS	6	1	2025	490.00
10	Stankonia	7	6	2000	5990.00
11	Utopia	8	2	2023	3490.00
12	Astroworld	8	2	2018	5490.00
13	Chicken Talk	9	2	2006	3490.00
14	Баста/Гуф	11	1	2010	3990.00
15	2 DAYS NO LEAN	12	2	2022	1490.00
16	NO COMMERCIAL LYRICS	12	2	2023	1990.00
17	Cuiser Aurora	13	1	2022	1990.00
18	Life of a Don	15	2	2021	4990.00
19	Heaven or Hell	15	2	2020	4490.00
20	Donny Womack	15	1	2018	2990.00
21	Goodbye & Good Riddance	16	1	2018	4490.00
22	Meet the Woo	17	3	2019	3490.00
23	Die a Legend	18	1	2019	3090.00
24	SremmLife	19	2	2015	3990.00
25	Eternal Atake	20	2	2020	3490.00
26	2014 Forest Hills Drive	21	1	2014	5490.00
27	Whole Lotta Red	22	2	2020	4490.00
28	Savage Mode	14	2	2016	4490.00
29	Return to the 36 Chambers: The Dirty Version	24	1	1995	4490.00
30	Tha Carter II	25	1	2005	4490.00
31	The Carter III	25	1	2008	5990.00
32	The Slim Shady LP	26	1	1999	5490.00
33	The Marshall Mathers LP	26	1	2000	5990.00
34	The Blueprint	27	1	2001	5490.00
35	Donda	28	1	2021	5990.00
36	Watch the Throne	28	1	2011	4990.00
37	The College Dropout	28	1	2004	3990.00
38	Late Registration	28	1	2005	4490.00
39	Yeezus	28	1	2013	5490.00
40	My Beautiful Dark Twisted Fantasy	28	1	2010	5990.00
41	Mystic Stylez	29	2	1995	4490.00
42	Get Rich or Die Tryin	30	7	2003	5490.00
43	Culture	32	2	2017	5490.00
44	Straight Outta Compton	33	7	1988	3990.00
45	The Chronic	34	7	1992	4490.00
46	2001	34	7	1999	4990.00
47	Finally Rich	35	3	2012	5990.00
48	All Eyez on Me	36	7	1996	5490.00
49	The Infamous	37	7	1995	5990.00
50	Illmatic	38	4	1994	5990.00
51	DS2	39	2	2015	5490.00
52	Enter the Wu-Tang (36 Chambers)	41	4	1993	5990.00
53	Ready to Die	42	7	1994	5990.00
\.


--
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: nikitatata
--

COPY public.artists (artist_id, artist_name, artist_country) FROM stdin;
1	Kendrick Lamar	USA
2	Kid Cudi	USA
3	Drake	USA
4	Young Thug	USA
5	A$AP Rocky	USA
6	MIYAN	Russia
7	OutKast	USA
8	Travis Scott	USA
9	Gucci Mane	USA
10	Баста	Russia
11	Guf	Russia
12	Heronwater	Russia
13	Friendly Thug	Russia
14	21 Savage	USA
15	Don Toliver	USA
16	Juice WRLD	USA
17	Pop Smoke	USA
18	Polo G	USA
19	Rae Sremmurd	USA
20	Lil Uzi Vert	USA
21	J. Cole	USA
22	Playboi Carti	USA
23	Metro Boomin	USA
24	Ol Dirty Bastard	USA
25	Lil Wayne	USA
26	Eminem	USA
27	Jay-Z	USA
28	Kanye West	USA
29	Three 6 Mafia	USA
30	50 Cent	USA
32	Migos	USA
33	N.W.A.	USA
34	Dr. Dre	USA
35	Chief Keef	USA
36	2Pac	USA
37	Mobb Deep	USA
38	Nas	USA
39	Future	USA
41	Wu-Tang Clan	USA
42	The Notorious B.I.G.	USA
\.


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: nikitatata
--

COPY public.genres (genre_id, genre_name) FROM stdin;
1	Рэп
2	Трэп
3	Дрилл
4	Бум-бэп
5	Клауд-рэп
6	Альтернативный хип-хоп
7	Гангста-рэп
\.


--
-- Name: albums_album_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nikitatata
--

SELECT pg_catalog.setval('public.albums_album_id_seq', 1, false);


--
-- Name: artists_artist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nikitatata
--

SELECT pg_catalog.setval('public.artists_artist_id_seq', 1, false);


--
-- Name: genres_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nikitatata
--

SELECT pg_catalog.setval('public.genres_genre_id_seq', 1, false);


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: nikitatata
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (album_id);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: nikitatata
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (artist_id);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: nikitatata
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (genre_id);


--
-- Name: albums albums_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nikitatata
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id);


--
-- Name: albums albums_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nikitatata
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(genre_id);


--
-- PostgreSQL database dump complete
--

\unrestrict EWKmx2aQpqDf9D1Dro30hgrGArxGDYOxd7KHOLrxtlp2hilwzvo1uqCyR79sGT2

