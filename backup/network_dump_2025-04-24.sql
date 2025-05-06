--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

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
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: dordavid
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO dordavid;

--
-- Name: endpoints; Type: TABLE; Schema: public; Owner: dordavid
--

CREATE TABLE public.endpoints (
    id integer NOT NULL,
    technician_name character varying(255) NOT NULL,
    point_location character varying(255) NOT NULL,
    destination_room character varying(255) NOT NULL,
    connected_port_number integer NOT NULL,
    rit_port_number character varying(50),
    network_color character varying(7),
    router_id integer NOT NULL,
    rit_prefix_id integer
);


ALTER TABLE public.endpoints OWNER TO dordavid;

--
-- Name: endpoints_id_seq; Type: SEQUENCE; Schema: public; Owner: dordavid
--

CREATE SEQUENCE public.endpoints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.endpoints_id_seq OWNER TO dordavid;

--
-- Name: endpoints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dordavid
--

ALTER SEQUENCE public.endpoints_id_seq OWNED BY public.endpoints.id;


--
-- Name: logs; Type: TABLE; Schema: public; Owner: dordavid
--

CREATE TABLE public.logs (
    id integer NOT NULL,
    action character varying(50) NOT NULL,
    entity character varying(50) NOT NULL,
    entity_id integer NOT NULL,
    technician_name character varying(100) NOT NULL,
    "timestamp" timestamp without time zone,
    details text
);


ALTER TABLE public.logs OWNER TO dordavid;

--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: dordavid
--

CREATE SEQUENCE public.logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.logs_id_seq OWNER TO dordavid;

--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dordavid
--

ALTER SEQUENCE public.logs_id_seq OWNED BY public.logs.id;


--
-- Name: networks; Type: TABLE; Schema: public; Owner: dordavid
--

CREATE TABLE public.networks (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(7) NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.networks OWNER TO dordavid;

--
-- Name: networks_id_seq; Type: SEQUENCE; Schema: public; Owner: dordavid
--

CREATE SEQUENCE public.networks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.networks_id_seq OWNER TO dordavid;

--
-- Name: networks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dordavid
--

ALTER SEQUENCE public.networks_id_seq OWNED BY public.networks.id;


--
-- Name: rit_prefixes; Type: TABLE; Schema: public; Owner: dordavid
--

CREATE TABLE public.rit_prefixes (
    id integer NOT NULL,
    prefix character varying(10) NOT NULL
);


ALTER TABLE public.rit_prefixes OWNER TO dordavid;

--
-- Name: rit_prefixes_id_seq; Type: SEQUENCE; Schema: public; Owner: dordavid
--

CREATE SEQUENCE public.rit_prefixes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rit_prefixes_id_seq OWNER TO dordavid;

--
-- Name: rit_prefixes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dordavid
--

ALTER SEQUENCE public.rit_prefixes_id_seq OWNED BY public.rit_prefixes.id;


--
-- Name: router_models; Type: TABLE; Schema: public; Owner: dordavid
--

CREATE TABLE public.router_models (
    id integer NOT NULL,
    model_name character varying(100)
);


ALTER TABLE public.router_models OWNER TO dordavid;

--
-- Name: router_models_id_seq; Type: SEQUENCE; Schema: public; Owner: dordavid
--

CREATE SEQUENCE public.router_models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.router_models_id_seq OWNER TO dordavid;

--
-- Name: router_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dordavid
--

ALTER SEQUENCE public.router_models_id_seq OWNED BY public.router_models.id;


--
-- Name: routers; Type: TABLE; Schema: public; Owner: dordavid
--

CREATE TABLE public.routers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    model_id integer,
    ip_address character varying(15) NOT NULL,
    floor integer NOT NULL,
    building character varying(50) NOT NULL,
    connection_speed character varying(50) NOT NULL,
    ports_count integer,
    is_stack boolean,
    slots_count integer,
    created_at timestamp without time zone,
    network_id integer NOT NULL
);


ALTER TABLE public.routers OWNER TO dordavid;

--
-- Name: routers_id_seq; Type: SEQUENCE; Schema: public; Owner: dordavid
--

CREATE SEQUENCE public.routers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.routers_id_seq OWNER TO dordavid;

--
-- Name: routers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dordavid
--

ALTER SEQUENCE public.routers_id_seq OWNED BY public.routers.id;


--
-- Name: switches; Type: TABLE; Schema: public; Owner: dordavid
--

CREATE TABLE public.switches (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    model character varying(100) NOT NULL,
    ip_address character varying(15) NOT NULL,
    router_id integer NOT NULL,
    connection_port integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.switches OWNER TO dordavid;

--
-- Name: switches_id_seq; Type: SEQUENCE; Schema: public; Owner: dordavid
--

CREATE SEQUENCE public.switches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.switches_id_seq OWNER TO dordavid;

--
-- Name: switches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dordavid
--

ALTER SEQUENCE public.switches_id_seq OWNED BY public.switches.id;


--
-- Name: endpoints id; Type: DEFAULT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.endpoints ALTER COLUMN id SET DEFAULT nextval('public.endpoints_id_seq'::regclass);


--
-- Name: logs id; Type: DEFAULT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.logs ALTER COLUMN id SET DEFAULT nextval('public.logs_id_seq'::regclass);


--
-- Name: networks id; Type: DEFAULT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.networks ALTER COLUMN id SET DEFAULT nextval('public.networks_id_seq'::regclass);


--
-- Name: rit_prefixes id; Type: DEFAULT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.rit_prefixes ALTER COLUMN id SET DEFAULT nextval('public.rit_prefixes_id_seq'::regclass);


--
-- Name: router_models id; Type: DEFAULT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.router_models ALTER COLUMN id SET DEFAULT nextval('public.router_models_id_seq'::regclass);


--
-- Name: routers id; Type: DEFAULT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.routers ALTER COLUMN id SET DEFAULT nextval('public.routers_id_seq'::regclass);


--
-- Name: switches id; Type: DEFAULT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.switches ALTER COLUMN id SET DEFAULT nextval('public.switches_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: dordavid
--

COPY public.alembic_version (version_num) FROM stdin;
52b510991b7b
\.


--
-- Data for Name: endpoints; Type: TABLE DATA; Schema: public; Owner: dordavid
--

COPY public.endpoints (id, technician_name, point_location, destination_room, connected_port_number, rit_port_number, network_color, router_id, rit_prefix_id) FROM stdin;
4	Tech Emma	Room A4	Room B4	104	204	#FFC300	1	5
1	Tech John	Room A1	Room B1	101	201	#FF5733	1	4
2	Tech Anna	Room A2	Room B2	102	202	#33FF57	1	4
3	Tech Mike	Room A3	Room B3	103	\N	#5733FF	1	4
5	Tech Leo	Room A5	Room B5	105	\N	#C70039	1	4
6	Tech John	Room C1	Room D1	201	301	#FF5733	2	4
7	Tech Anna	Room C2	Room D2	202	302	#33FF57	2	4
8	Tech Mike	Room C3	Room D3	203	\N	#5733FF	2	4
9	Tech Emma	Room C4	Room D4	204	304	#FFC300	2	4
10	Tech Leo	Room C5	Room D5	205	\N	#C70039	2	4
11	Tech John	Room E1	Room F1	301	401	#FF5733	3	4
12	Tech Anna	Room E2	Room F2	302	402	#33FF57	3	4
13	Tech Mike	Room E3	Room F3	303	\N	#5733FF	3	4
14	Tech Emma	Room E4	Room F4	304	404	#FFC300	3	4
15	Tech Leo	Room E5	Room F5	305	\N	#C70039	3	4
19	Tech Emma	Room G4	Room H4	404	504	#FFC300	4	4
21	Tech John	Room I1	Room J1	501	601	#FF5733	5	4
22	Tech Anna	Room I2	Room J2	502	602	#33FF57	5	4
24	Tech Emma	Room I4	Room J4	504	604	#FFC300	5	4
25	Tech Leo	Room I5	Room J5	505	\N	#C70039	5	4
27	Tech Anna	Room K2	Room L2	603	702	#33FF57	6	11
30	Tech Leo	Room K5	Room L555	605	2	#C70039	6	1
23	Tech Mike	Room I3	Room J3	503	-	#5733FF	5	7
26	dorda	Room K1	Room L1	601	701	#FF5733	6	6
29	Tech dor	Room K44567	Room k44	604	704	#FFC300	6	3
18	Tech Mike	Room G3	Room H3	403	20900	#5733FF	4	3
20	Tech Leo	Room G5	Room H5	405	88	#C70039	4	4
31	Tech John	Room M1	Room N1	701	801	#FF5733	7	4
32	Tech Anna	Room M2	Room N2	702	802	#33FF57	7	4
33	Tech Mike	Room M3	Room N3	703	\N	#5733FF	7	4
34	Tech Emma	Room M4	Room N4	704	804	#FFC300	7	4
35	Tech Leo	Room M5	Room N5	705	\N	#C70039	7	4
36	Tech John	Room O1	Room P1	801	901	#FF5733	8	4
37	Tech Anna	Room O2	Room P2	802	902	#33FF57	8	4
39	Tech Emma	Room O4	Room P4	804	904	#FFC300	8	4
40	Tech Leo	Room O5	Room P5	805	\N	#C70039	8	4
41	Tech John	Room Q1	Room R1	901	1001	#FF5733	9	4
42	Tech Anna	Room Q2	Room R2	902	1002	#33FF57	9	4
44	Tech Emma	Room Q4	Room R4	904	1004	#FFC300	9	4
45	Tech Leo	Room Q5	Room R5	905	\N	#C70039	9	4
47	dorda	30	ramah	6099	99998	#FFFFFF	1	7
46	dorda	3090	ramah	607	90208	#FFFFFF	6	10
49	dorda	1029	2756	284	294	#FFFFFF	11	3
50	dorda	134	324	6066	405	#FFFFFF	1	3
48	dorda	10102	2847	38346	102102	#FFFFFF	6	7
52	גםרגש	89	827	234	4	#FFFFFF	9	3
53	dorda	234	234	234	234	#FFFFFF	12	1
51	natan	2090	2930	2937	666	#FFFFFF	6	10
38	Tech Mike	Room O3	Room P3	803	303928	#5733FF	8	4
43	Tech Mike	Room Q3	Room R3	903	5609	#5733FF	9	4
54	Test Technician	Test Location	Room 101	1	2	#FFFFFF	6	1
55	דורדה	44	רמח	44	444	#FFFFFF	6	6
56	מושי	9020	מויש 1	333	622	#FFFFFF	6	4
57	אלדור	999	ירד לעם	345	999	#FFFFFF	6	11
59	דור	44	רמח	567	321	#FFFFFF	4	4
58	מממנננ	רררר	טי76	603	989	#FFFFFF	6	1
60	דורדהדה	876	רל״א	258	9080	#FFFFFF	10	12
61	אורי המלך	2020	חדר יפה	44	321	#FFFFFF	5	14
62	newestst	44	רמלח	66	888	#FFFFFF	4	11
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: dordavid
--

COPY public.logs (id, action, entity, entity_id, technician_name, "timestamp", details) FROM stdin;
1	update	Network	2	Unknown	2025-01-12 12:52:41.979198	Updated fields: Color: '#00FF00' -> '#98e698'
2	update	Network	1	Unknown	2025-01-12 12:52:52.632457	Updated fields: Color: '#FF0000' -> '#da6262'
3	update	Network	3	Unknown	2025-01-12 14:04:03.312263	Updated fields: Color: '#0000FF' -> '#7272e9'
4	update	Router	1	Admin	2025-01-12 14:47:54.580809	Router Router AA updated.
5	create	Network	4	Unknown	2025-01-13 12:02:29.220803	Network 'דרך ארוכה' added.
6	create	Network	5	Unknown	2025-01-13 14:00:38.038267	Network 'הים הרטוב' added.
7	create	Router	9	Admin	2025-01-14 10:35:31.250047	Router nKjn7P8 added.
8	update	Network	2	Unknown	2025-01-14 12:00:39.796677	Updated fields: Color: '#98e698' -> '#e698b4'
9	update	Router	3	Admin	2025-01-14 12:03:43.700182	Router Router C updated.
10	update	Router	2	Admin	2025-01-14 12:05:36.938793	Router Router B updated.
11	update	Network	1	Unknown	2025-01-16 09:20:31.989	Updated fields: Name: 'Network 1' -> 'Network 1.1', Color: '#da6262' -> '#c2f410'
12	update	Router	4	Admin	2025-01-16 09:37:03.842979	Router Router D.11 updated.
13	update	Router	4	Admin	2025-01-16 09:40:53.665225	Router Router D.99 updated.
14	update	Router	4	Admin	2025-01-16 09:43:09.202925	Router Router D.11 updated.
15	update	Router	5	Admin	2025-01-16 09:44:50.21578	Updated fields: name: 'Router E' -> 'Router Ex201'; ip_address: '192.168.3.1' -> '192.168.3.3'
16	create	Router	10	Admin	2025-01-16 09:46:38.776867	Router newest12 added.
17	update	Network	1	Unknown	2025-01-16 12:11:53.269064	Updated fields: Color: '#c2f410' -> '#a882ba'
18	update	Network	2	Unknown	2025-01-20 08:52:17.698769	Updated fields: Color: '#e698b4' -> '#4b83a0'
19	update	Router	3	Admin	2025-01-21 09:56:09.806331	Updated fields: ip_address: '192.168.2.1' -> '192.168.2.345'
20	create	Router	11	Admin	2025-01-21 10:08:26.87646	Router noam added.
21	update	Router	8	Admin	2025-01-21 10:26:27.146508	Updated fields: connection_speed: '10 Gbps' -> '1Gbps'
22	update	Router	7	Admin	2025-01-21 10:27:14.472007	Updated fields: connection_speed: '10 Gbps' -> '1Gbps'
23	Update	Endpoint	28	Tech Mike	2025-01-28 09:44:23.121514	Updated endpoint with changes: rit_port_number: '4' -> '4678'
24	Add	RitPrefix	10	System	2025-01-28 10:09:22.949284	Added RIT prefix with ID 10
25	Update	Endpoint	46	dorda	2025-01-28 10:09:44.837401	Updated endpoint with changes: rit_prefix_id: '7' -> '10'
26	Add	Endpoint	48	dorda	2025-01-28 10:38:24.278399	Added endpoint with ID 48
27	Update	Endpoint	48	dorda	2025-01-28 10:38:41.737431	Updated endpoint with changes: rit_prefix_id: '2' -> '7'
28	Add	Endpoint	49	dorda	2025-01-28 10:39:16.954692	Added endpoint with ID 49
29	Add	Endpoint	50	dorda	2025-01-28 11:46:37.050906	Added endpoint with ID 50
30	Update	Endpoint	48	dorda	2025-01-28 11:47:14.037269	Updated endpoint with changes: 
31	Update	Endpoint	29	Tech Emma	2025-01-28 11:49:38.065041	Updated endpoint with changes: rit_prefix_id: '3' -> '10'
32	Update	Endpoint	26	dorda	2025-01-28 11:50:18.440867	Updated endpoint with changes: technician_name: 'Tech John' -> 'dorda'
33	Add	Endpoint	51	natan	2025-01-28 11:54:22.034429	Added endpoint with ID 51
34	Add	Endpoint	52	גםרגש	2025-01-28 12:17:34.02924	Added endpoint with ID 52
35	Update	Endpoint	29	Tech dor	2025-01-29 08:59:31.614725	Updated endpoint with changes: technician_name: 'Tech Emma' -> 'Tech dor', rit_prefix_id: '10' -> '3'
36	create	Network	7	Unknown	2025-01-29 09:00:10.635894	Network 'שמיים בהירים' added.
37	create	Router	12	Admin	2025-01-29 09:01:18.690894	Router skdhh added.
38	Add	Endpoint	53	dorda	2025-01-29 09:05:37.528454	Added endpoint with ID 53
39	Update	Endpoint	30	Tech Leo	2025-01-30 11:56:01.891205	Updated endpoint with changes: rit_prefix_id: '9' -> '1'
40	Update	Endpoint	28	Tech Mike	2025-01-30 11:56:34.503918	Updated endpoint with changes: rit_prefix_id: '2' -> '4'
41	Update	Endpoint	51	natan	2025-01-30 11:56:51.861497	Updated endpoint with changes: rit_prefix_id: '8' -> '10'
42	Update	Endpoint	36	Tech John	2025-02-02 12:49:32.185511	Updated endpoint with changes: 
43	create	Router	13	Admin	2025-02-03 12:19:22.07485	Router nerew added.
44	update	Network	1	Unknown	2025-02-04 08:45:58.455941	Updated fields: Color: '#a882ba' -> '#cfd94a'
45	create	Router	14	Admin	2025-02-04 08:57:01.569212	Router new ritpit added.
46	Update	Endpoint	38	Tech Mike	2025-02-11 09:48:46.780024	Updated endpoint with changes: rit_port_number: 'None' -> '303928'
47	update	Network	7	Unknown	2025-02-12 09:28:23.875436	Updated fields: Description: '' -> 'ביום מעונן'
48	update	Router	9	Admin	2025-02-12 14:11:57.002721	Updated fields: name: 'nKjn7P8' -> 'nKjn99999'
49	update	Router	12	Admin	2025-02-13 13:52:04.189891	Updated fields: ip_address: '23.4.5.6' -> '23.4.5.666'; ports_count: '24' -> '48'
50	update	Network	3	Unknown	2025-02-17 11:53:40.818931	Updated fields: Description: 'My third network' -> 'My third network 99'
51	update	Network	1	Unknown	2025-02-18 12:25:55.627212	Updated fields: Color: '#cfd94a' -> '#788104'
52	Add	RitPrefix	11	System	2025-02-18 12:29:48.200113	Added RIT prefix with ID 11
53	Update	Endpoint	27	Tech Anna	2025-02-18 12:30:04.151959	Updated endpoint with changes: rit_prefix_id: '2' -> '11'
54	Update	Endpoint	30	Tech Leo	2025-02-18 13:28:55.622093	Updated endpoint with changes: destination_room: 'Room L5' -> 'Room L555'
55	create	Router	15	Admin	2025-02-19 09:55:03.438168	Router ראוטרסוויץביץ added.
56	create	Network	8	Unknown	2025-02-20 13:29:08.799716	Network 'למחוק' added.
57	update	Network	8	Unknown	2025-02-20 13:29:20.148191	Updated fields: Description: 'למחוק' -> 'למחוק מייייד'
58	delete	Network	8	Unknown	2025-02-20 13:29:26.689956	Network 'למחוק' deleted.
59	create	Network	9	Unknown	2025-02-20 13:29:48.7567	Network 'למחוק ' added.
60	delete	Network	9	Unknown	2025-02-20 13:29:56.514039	Network 'למחוק ' deleted.
61	create	Network	10	Unknown	2025-02-20 13:40:14.274637	Network 'למחוק' added.
62	delete	Network	10	Unknown	2025-02-20 13:40:31.432596	Network 'למחוק' deleted.
63	create	Network	11	Unknown	2025-02-20 14:21:08.165938	Network 'למחוקקק' added.
64	delete	Network	11	Unknown	2025-02-20 14:21:15.73042	Network 'למחוקקק' deleted.
65	create	Network	12	Unknown	2025-02-20 14:21:44.712643	Network 'למחווקקקק' added.
66	delete	Network	12	Unknown	2025-02-20 14:21:50.237947	Network 'למחווקקקק' deleted.
67	create	Router	16	Admin	2025-02-24 13:59:17.992231	Router חדש חדש חדש added.
68	Update	Endpoint	23	Tech Mike	2025-02-25 13:18:44.537482	Updated endpoint with changes: rit_port_number: 'None' -> '-', rit_prefix_id: '4' -> '7'
69	update	Network	4	Unknown	2025-03-09 14:51:28.025076	Updated fields: Color: '#e4950c' -> '#ddaf5f'
70	Update	Endpoint	26	dorda	2025-03-11 15:42:34.048297	Updated endpoint with changes: rit_prefix_id: '3' -> '6'
71	Update	Endpoint	43	Tech Mike	2025-03-13 10:39:49.865662	Updated endpoint with changes: rit_port_number: 'None' -> '5609'
72	update	Network	1	Unknown	2025-03-27 10:51:10.261192	Updated fields: Color: '#788104' -> '#f462cd'
73	create	Router	17	Admin	2025-03-27 12:52:57.747195	Router מויש added.
74	Add	RitPrefix	12	System	2025-03-27 12:54:03.892803	Added RIT prefix with ID 12
75	create	Router	18	Admin	2025-03-31 10:42:09.643354	Router newest added.
76	Update	Endpoint	29	Tech dor	2025-03-31 11:54:19.462634	Updated endpoint with changes: point_location: 'Room K4' -> 'Room K44567'
77	Add	Endpoint	54	Test Technician	2025-04-01 14:47:28.125815	Added endpoint with ID 54
78	Add	RitPrefix	13	System	2025-04-03 11:34:07.189288	Added RIT prefix with ID 13
79	Add	Endpoint	55	דורדה	2025-04-03 11:54:09.779646	Added endpoint with ID 55
80	Add	Endpoint	56	מושי	2025-04-03 11:58:52.109457	Added endpoint with ID 56
81	Add	Endpoint	57	אלדור	2025-04-03 12:06:41.380105	Added endpoint with ID 57
82	Add	Endpoint	58	מממ	2025-04-03 12:11:10.43436	Added endpoint with ID 58
83	Delete	Endpoint	28	Tech Mike	2025-04-03 12:22:10.457641	Deleted endpoint with ID 28
84	Delete	Endpoint	16	Tech John	2025-04-06 11:49:41.723881	Deleted endpoint with ID 16
85	Delete	Endpoint	17	Tech Anna	2025-04-06 11:53:29.474187	Deleted endpoint with ID 17
86	Add	Endpoint	59	דור	2025-04-09 11:46:16.033397	Added endpoint with ID 59
87	Update	Endpoint	18	Tech Mike	2025-04-09 12:03:36.187077	Updated endpoint with ID 18
88	Update	Endpoint	20	Tech Leo	2025-04-09 12:03:50.148736	Updated endpoint with ID 20
89	Update	Endpoint	58	מממנננ	2025-04-21 10:56:22.116268	Updated endpoint with ID 58
90	Add	Endpoint	60	דורדהדה	2025-04-23 11:50:07.428919	Added endpoint with ID 60
91	Add	RitPrefix	14	System	2025-04-23 12:05:36.751619	Added RIT prefix with ID 14
92	Add	Endpoint	61	אורי המלך	2025-04-23 12:05:48.420188	Added endpoint with ID 61
93	Add	Endpoint	62	newestst	2025-04-24 13:42:35.16431	Added endpoint with ID 62
\.


--
-- Data for Name: networks; Type: TABLE DATA; Schema: public; Owner: dordavid
--

COPY public.networks (id, name, description, color, created_at) FROM stdin;
5	הים הרטוב	הרשת של הים	#a4e0f4	2025-01-13 14:00:38.03123
2	Network 2	My second network	#4b83a0	\N
7	שמיים בהירים	ביום מעונן	#9ed0ff	2025-01-29 09:00:10.630867
3	Network 3	My third network 99	#7272e9	\N
4	דרך ארוכה	רשת דרך ארוכה	#ddaf5f	2025-01-13 12:02:29.214258
1	Network 1.1	My first network	#f462cd	\N
\.


--
-- Data for Name: rit_prefixes; Type: TABLE DATA; Schema: public; Owner: dordavid
--

COPY public.rit_prefixes (id, prefix) FROM stdin;
1	RIT-101
2	RIT-102
3	RIT-103
4	RIT-200
5	RIT-300
6	RIT-400
7	Example
8	Exam
9	exapp
10	newRit
11	ddd999
12	A02
13	newesttttt
14	B02
\.


--
-- Data for Name: router_models; Type: TABLE DATA; Schema: public; Owner: dordavid
--

COPY public.router_models (id, model_name) FROM stdin;
1	Cisco Model-100
2	HP Model-200
3	Netgear Model-300
4	Juniper Model-400
5	Aruba Model-500
6	tplink x20
7	tplink x7 mesh
8	tp-noam x30
9	tp shsh
10	tsxk-30h
11	חדש חדש חדש
12	מוישייי
\.


--
-- Data for Name: routers; Type: TABLE DATA; Schema: public; Owner: dordavid
--

COPY public.routers (id, name, model_id, ip_address, floor, building, connection_speed, ports_count, is_stack, slots_count, created_at, network_id) FROM stdin;
6	Router F	6	192.168.3.2	2	Pit	1 Gbps	8	t	2	\N	3
1	Router AA	6	192.168.1.1	1	North	1 Gbps	24	f	0	\N	1
2	Router B	6	192.168.1.2	2	North	1 Gbps	24	t	2	\N	1
4	Router D.11	6	192.168.2.22	2	South	100 Mbps	16	f	0	\N	2
5	Router Ex201	6	192.168.3.3	1	Pit	1 Gbps	8	t	2	\N	3
10	newest12	7	1.5.7.43	6	South	1Gbps	48	f	0	2025-01-16 09:46:38.771297	5
3	Router C	6	192.168.2.345	1	South	1Gbps	16	f	0	\N	2
11	noam	8	1.2.4.666	3	North	1Gbps	24	f	0	2025-01-21 10:08:26.870473	5
8	Router H	6	192.168.4.2	2	Pit	1Gbps	48	f	4	\N	2
7	Router G	6	192.168.4.1	1	North	1Gbps	48	f	4	\N	1
13	nerew	6	1.3.5.7	3	North	100Mbps	24	f	0	2025-02-03 12:19:22.064912	4
14	new ritpit	10	4.6.3.8	3	South	10Mbps	48	f	0	2025-02-04 08:57:01.559277	4
9	nKjn99999	6	2.3.4.5	5	North	1Gbps	8	f	0	2025-01-14 10:35:31.244515	1
12	skdhh	9	23.4.5.666	3	South	1Gbps	48	f	0	2025-01-29 09:01:18.686099	7
15	ראוטרסוויץביץ	6	234.67.190.13	2	South	1Gbps	48	f	0	2025-02-19 09:55:03.430972	5
16	חדש חדש חדש	11	1.18.19.2	5	South	100Mbps	24	f	0	2025-02-24 13:59:17.982263	7
17	מויש	12	3.5.6.9	9	North	1Gbps	48	f	0	2025-03-09 14:09:02.166897	5
18	newest	2	30.95.23.1	16	South	1Gbps	48	f	0	2025-03-31 10:41:21.489873	7
\.


--
-- Data for Name: switches; Type: TABLE DATA; Schema: public; Owner: dordavid
--

COPY public.switches (id, name, model, ip_address, router_id, connection_port, created_at) FROM stdin;
\.


--
-- Name: endpoints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dordavid
--

SELECT pg_catalog.setval('public.endpoints_id_seq', 62, true);


--
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dordavid
--

SELECT pg_catalog.setval('public.logs_id_seq', 93, true);


--
-- Name: networks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dordavid
--

SELECT pg_catalog.setval('public.networks_id_seq', 12, true);


--
-- Name: rit_prefixes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dordavid
--

SELECT pg_catalog.setval('public.rit_prefixes_id_seq', 14, true);


--
-- Name: router_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dordavid
--

SELECT pg_catalog.setval('public.router_models_id_seq', 12, true);


--
-- Name: routers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dordavid
--

SELECT pg_catalog.setval('public.routers_id_seq', 18, true);


--
-- Name: switches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dordavid
--

SELECT pg_catalog.setval('public.switches_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: endpoints endpoints_pkey; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT endpoints_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: networks networks_name_key; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.networks
    ADD CONSTRAINT networks_name_key UNIQUE (name);


--
-- Name: networks networks_pkey; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.networks
    ADD CONSTRAINT networks_pkey PRIMARY KEY (id);


--
-- Name: rit_prefixes rit_prefixes_pkey; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.rit_prefixes
    ADD CONSTRAINT rit_prefixes_pkey PRIMARY KEY (id);


--
-- Name: rit_prefixes rit_prefixes_prefix_key; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.rit_prefixes
    ADD CONSTRAINT rit_prefixes_prefix_key UNIQUE (prefix);


--
-- Name: router_models router_models_model_name_key; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.router_models
    ADD CONSTRAINT router_models_model_name_key UNIQUE (model_name);


--
-- Name: router_models router_models_pkey; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.router_models
    ADD CONSTRAINT router_models_pkey PRIMARY KEY (id);


--
-- Name: routers routers_ip_address_key; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT routers_ip_address_key UNIQUE (ip_address);


--
-- Name: routers routers_name_key; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT routers_name_key UNIQUE (name);


--
-- Name: routers routers_pkey; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT routers_pkey PRIMARY KEY (id);


--
-- Name: switches switches_ip_address_key; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_ip_address_key UNIQUE (ip_address);


--
-- Name: switches switches_name_key; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_name_key UNIQUE (name);


--
-- Name: switches switches_pkey; Type: CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_pkey PRIMARY KEY (id);


--
-- Name: endpoints endpoints_rit_prefix_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT endpoints_rit_prefix_id_fkey FOREIGN KEY (rit_prefix_id) REFERENCES public.rit_prefixes(id);


--
-- Name: endpoints endpoints_router_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT endpoints_router_id_fkey FOREIGN KEY (router_id) REFERENCES public.routers(id);


--
-- Name: routers routers_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT routers_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.router_models(id);


--
-- Name: routers routers_network_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.routers
    ADD CONSTRAINT routers_network_id_fkey FOREIGN KEY (network_id) REFERENCES public.networks(id);


--
-- Name: switches switches_router_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dordavid
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_router_id_fkey FOREIGN KEY (router_id) REFERENCES public.routers(id);


--
-- PostgreSQL database dump complete
--

