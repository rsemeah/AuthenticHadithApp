-- Migration: Seed lessons with teaching text and link to real hadith via keyword search
-- This seeds all 4 learning paths with detailed lessons and hadith assignments.
-- It uses subqueries against the hadith table to find relevant hadith by keyword.

-- =============================================================
-- HELPER: temporary function to insert a lesson, link it to a path,
-- and attach hadith by keyword search
-- =============================================================

CREATE OR REPLACE FUNCTION _seed_lesson(
  p_path_title text,
  p_sort int,
  p_title text,
  p_summary text,
  p_teaching text,
  p_minutes int,
  p_keywords text[]  -- array of keywords to search english_text
) RETURNS void AS $$
DECLARE
  v_lesson_id uuid;
  v_path_id uuid;
  v_hadith_row record;
  v_ord int := 0;
BEGIN
  SELECT id INTO v_path_id FROM public.learning_paths WHERE title = p_path_title LIMIT 1;
  IF v_path_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.lessons (title, summary, teaching_text, estimated_minutes)
  VALUES (p_title, p_summary, p_teaching, p_minutes)
  RETURNING id INTO v_lesson_id;

  INSERT INTO public.path_lessons (path_id, lesson_id, sort_order)
  VALUES (v_path_id, v_lesson_id, p_sort);

  -- Attach up to 5 hadith matching any keyword
  FOR v_hadith_row IN
    SELECT DISTINCT ON (h.id) h.id
    FROM public.hadith h, unnest(p_keywords) kw
    WHERE h.english_text ILIKE '%' || kw || '%'
    ORDER BY h.id
    LIMIT 5
  LOOP
    v_ord := v_ord + 1;
    INSERT INTO public.lesson_hadith (lesson_id, hadith_id, sort_order)
    VALUES (v_lesson_id, v_hadith_row.id, v_ord)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- PATH 1: Foundations of Faith (beginner, 12 lessons)
-- =============================================================

SELECT _seed_lesson('Foundations of Faith', 1,
  'The Importance of Intention',
  'Every deed begins with its intention — learn why niyyah is the foundation of all worship.',
  'The Prophet (peace be upon him) taught that actions are judged by their intentions. This principle is so foundational that scholars like Imam al-Bukhari chose to open his entire collection with this hadith. Intention (niyyah) is what distinguishes an act of worship from a mere habit. Eating can be worship if you intend to nourish your body for Allah''s sake. Sleeping can be worship if you intend to rest so you can pray at night. Every Muslim should examine their intention before any action.',
  5, ARRAY['intention', 'niyyah', 'deeds are judged', 'actions are by intention']);

SELECT _seed_lesson('Foundations of Faith', 2,
  'The Five Pillars of Islam',
  'The five foundational acts that define a Muslim''s practice.',
  'Islam is built upon five pillars: the testimony of faith (shahada), prayer (salah), charity (zakat), fasting in Ramadan (sawm), and pilgrimage to Makkah (hajj). These are not merely rituals but a complete system of spiritual development. The shahada establishes belief, prayer maintains connection with Allah five times daily, zakat purifies wealth and builds community, fasting develops self-discipline and empathy, and hajj unifies the ummah in submission to Allah.',
  8, ARRAY['five pillars', 'built upon five', 'shahada', 'testimony of faith', 'Islam is built']);

SELECT _seed_lesson('Foundations of Faith', 3,
  'The Six Articles of Faith',
  'What every Muslim must believe — from Allah to the Day of Judgment.',
  'Iman (faith) encompasses belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree (qadr). The famous hadith of Jibril teaches us these articles directly. Faith is not passive — it increases with obedience and decreases with sin. Understanding these articles gives a Muslim certainty and peace, knowing that everything happens by Allah''s wisdom and decree.',
  7, ARRAY['belief in Allah', 'angels', 'his books', 'his messengers', 'last day', 'divine decree', 'Jibril']);

SELECT _seed_lesson('Foundations of Faith', 4,
  'Sincerity in Worship',
  'Ikhlas — doing everything purely for the sake of Allah.',
  'Sincerity (ikhlas) means performing acts of worship solely for Allah, without seeking praise, recognition, or worldly gain. The Prophet warned against showing off (riya) in worship, calling it the "minor shirk." A prayer performed to impress others loses its reward. Sincerity transforms ordinary actions into worship and is the key to acceptance of all deeds.',
  5, ARRAY['sincerity', 'showing off', 'riya', 'purely for Allah', 'ikhlas']);

SELECT _seed_lesson('Foundations of Faith', 5,
  'Tawheed: The Oneness of Allah',
  'Understanding monotheism — the most important concept in Islam.',
  'Tawheed is the foundation upon which all of Islam rests. It means affirming that Allah alone deserves worship, that He has no partners, and that His names and attributes are unique to Him. The Prophet spent 13 years in Makkah calling people to tawheed before any other legislation was revealed. Shirk (associating partners with Allah) is the only sin that Allah does not forgive if one dies upon it.',
  6, ARRAY['oneness of Allah', 'tawheed', 'no god but Allah', 'shirk', 'associating partners', 'la ilaha']);

SELECT _seed_lesson('Foundations of Faith', 6,
  'The Quran as Guidance',
  'How the Prophet described and interacted with the Book of Allah.',
  'The Quran is the speech of Allah, revealed to Prophet Muhammad through the angel Jibril over 23 years. The Prophet described it as a rope stretched between heaven and earth, a light, and a cure. He encouraged reciting it regularly, learning it, and teaching it to others. The best among Muslims are those who learn the Quran and teach it. Regular recitation brings tranquility to the heart and light on the Day of Judgment.',
  6, ARRAY['Quran', 'recite', 'recitation', 'book of Allah', 'learn the Quran', 'teach the Quran']);

SELECT _seed_lesson('Foundations of Faith', 7,
  'Following the Sunnah',
  'Why the Prophet''s example is essential alongside the Quran.',
  'The Sunnah is the practical demonstration of Islam. Allah commanded Muslims to follow the Prophet''s example in the Quran. The Prophet said that he was given the Quran and something similar to it — meaning his Sunnah. Rejecting the Sunnah means rejecting a primary source of Islamic guidance. The Sunnah explains, elaborates, and complements the Quran.',
  5, ARRAY['sunnah', 'follow me', 'obey the messenger', 'example', 'my way', 'my practice']);

SELECT _seed_lesson('Foundations of Faith', 8,
  'Tawbah: Repentance',
  'The door of repentance is always open — understanding how to return to Allah.',
  'Allah loves those who repent. The Prophet taught that every son of Adam sins, and the best of sinners are those who repent. Repentance (tawbah) requires three conditions: stopping the sin, feeling genuine remorse, and resolving never to return to it. If the sin involved another person, their rights must also be restored. Allah''s mercy is vast — He extends His hand at night for those who sinned during the day, and during the day for those who sinned at night.',
  6, ARRAY['repent', 'repentance', 'tawbah', 'forgive', 'forgiveness', 'mercy of Allah', 'return to Allah']);

SELECT _seed_lesson('Foundations of Faith', 9,
  'The Reality of the Hereafter',
  'What the Prophet taught about death, the grave, and the Day of Judgment.',
  'The Prophet frequently reminded his companions about death and the hereafter. He taught that the grave is either a garden from the gardens of Paradise or a pit from the pits of Hell. The Day of Judgment will be a day of 50,000 years, where every person will stand before Allah and be questioned about their life, youth, wealth, and knowledge. Remembering death softens the heart and motivates righteous action.',
  7, ARRAY['death', 'hereafter', 'day of judgment', 'grave', 'paradise', 'hellfire', 'resurrection']);

SELECT _seed_lesson('Foundations of Faith', 10,
  'Trust in Allah (Tawakkul)',
  'Relying on Allah while taking practical means.',
  'Tawakkul is trusting in Allah while also taking practical steps. The Prophet taught to tie your camel and then trust in Allah. It does not mean abandoning effort — rather, it means doing your best while knowing that the outcome is in Allah''s hands. True tawakkul brings peace of mind because the believer knows that whatever happens is by Allah''s decree and contains wisdom.',
  5, ARRAY['trust in Allah', 'tawakkul', 'rely on Allah', 'tie your camel', 'put your trust']);

SELECT _seed_lesson('Foundations of Faith', 11,
  'Brotherhood and Sisterhood in Islam',
  'The bonds of faith that unite all Muslims.',
  'The Prophet established brotherhood as a core value of the Muslim community. He said that none of you truly believes until he loves for his brother what he loves for himself. He compared the Muslim ummah to a single body — when one part hurts, the whole body responds with fever and sleeplessness. This brotherhood transcends race, nationality, and social status.',
  5, ARRAY['brother', 'brotherhood', 'believes until he loves', 'single body', 'ummah', 'unity']);

SELECT _seed_lesson('Foundations of Faith', 12,
  'Avoiding Innovation in Religion',
  'Staying on the straight path by following what was revealed.',
  'The Prophet warned against innovation (bid''ah) in religious matters. He said that every innovation is misguidance. This refers to inventing new acts of worship or altering established religious practices without basis in the Quran or Sunnah. Islam was perfected during the Prophet''s lifetime, and the companions are the best example of how to practice it. Innovation in worldly matters (technology, medicine, etc.) is permissible and even encouraged.',
  5, ARRAY['innovation', 'bid''ah', 'misguidance', 'every innovation', 'newly invented']);

-- =============================================================
-- PATH 2: Daily Practice (intermediate, 15 lessons)
-- =============================================================

SELECT _seed_lesson('Daily Practice', 1,
  'Waking Up: Morning Adhkar',
  'Start your day with the words the Prophet spoke every morning.',
  'The Prophet had a specific routine upon waking. He would wipe his face, recite the last verses of Surah Al-Imran, use the miswak, and make specific supplications. Beginning the day with remembrance of Allah sets the spiritual tone for everything that follows. The morning adhkar serve as a shield against harm and a source of barakah throughout the day.',
  5, ARRAY['waking up', 'morning', 'adhkar', 'wake', 'supplication morning', 'rises from sleep']);

SELECT _seed_lesson('Daily Practice', 2,
  'The Prayer: Preparation and Wudu',
  'Purification before prayer — the physical and spiritual cleansing.',
  'Wudu (ablution) is both a physical washing and a spiritual purification. The Prophet taught that when a Muslim washes during wudu, sins fall away with the water. The proper sequence is: intention, washing hands, rinsing mouth and nose, washing the face, washing arms to elbows, wiping the head and ears, and washing feet to ankles. Each step should be performed mindfully, as wudu is itself an act of worship.',
  8, ARRAY['wudu', 'ablution', 'wash', 'purification', 'water', 'prayer preparation']);

SELECT _seed_lesson('Daily Practice', 3,
  'Perfecting Your Salah',
  'Praying as the Prophet prayed — with focus, humility, and proper form.',
  'The Prophet said: "Pray as you have seen me praying." Salah is the most important daily act of worship — it is the first thing a person will be asked about on the Day of Judgment. Key elements include standing straight, reciting with contemplation, bowing with the back level, prostrating with seven bones touching the ground, and maintaining khushu (focus and humility). The Prophet would pray with such devotion that the sound of crying could be heard from his chest.',
  10, ARRAY['prayer', 'salah', 'pray as you have seen me', 'prostration', 'bowing', 'khushu']);

SELECT _seed_lesson('Daily Practice', 4,
  'The Fajr Prayer',
  'Why the dawn prayer holds special significance in Islam.',
  'The Fajr prayer is uniquely emphasized in prophetic teachings. The Prophet said that whoever prays Fajr is under Allah''s protection for the entire day. He also said the two rak''ahs before Fajr (sunnah) are better than the world and everything in it. Fajr in congregation is particularly virtuous — the hypocrites find Fajr and Isha the most difficult prayers. Waking for Fajr is a sign of sincere faith.',
  5, ARRAY['fajr', 'dawn prayer', 'morning prayer', 'two rakahs before fajr']);

SELECT _seed_lesson('Daily Practice', 5,
  'Eating with Prophetic Etiquette',
  'The sunnah of eating — from bismillah to washing hands.',
  'The Prophet taught comprehensive eating etiquette: say Bismillah before eating, eat with the right hand, eat from what is nearest to you, do not criticize food, do not eat while reclining, eat less (one-third food, one-third water, one-third air), and praise Allah after finishing. These simple practices transform meals into acts of worship and promote health and gratitude.',
  5, ARRAY['eating', 'right hand', 'bismillah', 'food', 'eat from what is nearest', 'one third']);

SELECT _seed_lesson('Daily Practice', 6,
  'Dhikr Throughout the Day',
  'Simple phrases of remembrance that carry enormous reward.',
  'Dhikr (remembrance of Allah) is one of the easiest yet most rewarding acts of worship. SubhanAllah, Alhamdulillah, Allahu Akbar, and La ilaha illallah — these short phrases can be said at any time and place. The Prophet said that saying "SubhanAllah wa bihamdihi" 100 times a day erases sins even if they are like the foam of the sea. The tongue should always be moist with the remembrance of Allah.',
  5, ARRAY['dhikr', 'remembrance', 'SubhanAllah', 'Alhamdulillah', 'Allahu Akbar', 'glorify']);

SELECT _seed_lesson('Daily Practice', 7,
  'The Sunnah Prayers (Rawatib)',
  'Voluntary prayers that guard and complement the obligatory ones.',
  'The Prophet regularly prayed sunnah prayers before and after the obligatory ones. Twelve rak''ahs of sunnah rawatib per day earns a house in Paradise: 2 before Fajr, 4 before Dhuhr, 2 after Dhuhr, 2 after Maghrib, and 2 after Isha. These prayers serve as a buffer — if there is any deficiency in the obligatory prayers, the voluntary ones compensate for it on the Day of Judgment.',
  6, ARRAY['sunnah prayer', 'voluntary prayer', 'rawatib', 'twelve rakahs', 'house in paradise', 'nafl']);

SELECT _seed_lesson('Daily Practice', 8,
  'Dua: The Weapon of the Believer',
  'How, when, and what to ask from Allah.',
  'Dua (supplication) is the essence of worship. The Prophet taught that dua is worship itself. There are etiquettes of dua: face the qiblah, raise your hands, begin with praising Allah and sending salawat on the Prophet, ask with certainty, and be persistent. Special times when dua is accepted include the last third of the night, between adhan and iqamah, while prostrating, while fasting, and while traveling.',
  7, ARRAY['dua', 'supplication', 'ask Allah', 'call upon', 'raise your hands', 'pray to Allah']);

SELECT _seed_lesson('Daily Practice', 9,
  'Friday: The Best Day of the Week',
  'The virtues and practices of Jumu''ah.',
  'The Prophet called Friday the best day on which the sun rises. It is recommended to take a bath, wear clean clothes, apply fragrance, go early to the masjid, and send abundant salawat on the Prophet. There is a special hour on Friday when dua is accepted. Reciting Surah Al-Kahf on Friday provides light between two Fridays. Neglecting Jumu''ah prayer three times without excuse leads to a seal being placed on the heart.',
  6, ARRAY['friday', 'jumu''ah', 'best day', 'surah kahf', 'jumuah']);

SELECT _seed_lesson('Daily Practice', 10,
  'Sleeping with the Sunnah',
  'The Prophetic bedtime routine for protection and peace.',
  'The Prophet had a complete bedtime routine: performing wudu before sleeping, sleeping on the right side, placing the right hand under the cheek, reciting Ayat al-Kursi (protection from shaytan until morning), reciting the last two verses of Surah Al-Baqarah, blowing into the palms and reciting the three Quls, and making specific duas. Following this routine brings physical rest and spiritual protection.',
  5, ARRAY['sleep', 'sleeping', 'bedtime', 'right side', 'ayat al-kursi', 'night']);

SELECT _seed_lesson('Daily Practice', 11,
  'Entering and Leaving the Home',
  'Duas and etiquettes for daily transitions.',
  'The Prophet taught specific supplications for entering and leaving the home. Upon entering, one should say "Bismillah" and greet the family with salaam. Upon leaving, one should say "Bismillah, tawakkaltu ala Allah" (In the name of Allah, I place my trust in Allah). These small practices invite barakah into the home and provide protection outside it.',
  4, ARRAY['entering the home', 'leaving the home', 'greet', 'salaam', 'bismillah']);

SELECT _seed_lesson('Daily Practice', 12,
  'The Miswak and Personal Hygiene',
  'Cleanliness is half of faith — Prophetic hygiene practices.',
  'The Prophet placed great emphasis on personal cleanliness. He said that cleanliness is half of faith. He regularly used the miswak (tooth stick), especially before prayer, upon waking, and before entering the home. He trimmed his nails, maintained his beard, used fragrance, and kept his clothes clean. These are not mere cultural habits but acts of worship that reflect a Muslim''s respect for themselves and others.',
  5, ARRAY['miswak', 'cleanliness', 'hygiene', 'clean', 'purity', 'half of faith', 'fitrah']);

SELECT _seed_lesson('Daily Practice', 13,
  'Charity in Daily Life',
  'Sadaqah is not just money — every good deed is charity.',
  'The Prophet taught that charity extends far beyond financial giving. A smile is charity. Removing harm from the road is charity. A kind word is charity. Helping someone with their belongings is charity. Even the food you place in your spouse''s mouth is charity. This expansive understanding means that every Muslim, regardless of wealth, can give charity constantly throughout the day.',
  5, ARRAY['charity', 'sadaqah', 'smile is charity', 'good deed', 'giving', 'generosity']);

SELECT _seed_lesson('Daily Practice', 14,
  'Evening Adhkar and Reflection',
  'Ending the day with protection and gratitude.',
  'Just as the morning has its adhkar, the evening has its own set of protective supplications. The Prophet taught specific duas to be said between Asr and Maghrib. The evening is also a time for muhasabah (self-accounting) — reflecting on the day, seeking forgiveness for shortcomings, and planning to do better tomorrow. This daily reflection keeps the heart alive and prevents spiritual complacency.',
  5, ARRAY['evening', 'adhkar', 'reflection', 'afternoon', 'asr', 'seeking forgiveness']);

SELECT _seed_lesson('Daily Practice', 15,
  'The Night Prayer (Tahajjud)',
  'The most virtuous prayer after the obligatory ones.',
  'The Prophet said that the best prayer after the obligatory prayers is the night prayer (qiyam al-layl / tahajjud). He would stand in prayer at night until his feet swelled. The last third of the night is when Allah descends to the lowest heaven and asks: "Is there anyone asking so that I may give? Is there anyone seeking forgiveness so that I may forgive?" Even two short rak''ahs at night carry immense reward.',
  7, ARRAY['night prayer', 'tahajjud', 'qiyam', 'last third of the night', 'stand at night']);

-- =============================================================
-- PATH 3: Character & Conduct (advanced, 18 lessons)
-- =============================================================

SELECT _seed_lesson('Character & Conduct', 1,
  'The Prophet''s Character',
  'The best example for all of humanity — his manners, patience, and mercy.',
  'When Aisha was asked about the Prophet''s character, she said: "His character was the Quran." He was the most generous, the bravest, the most patient, and the most forgiving of people. He would mend his own shoes, help with household chores, and never strike anyone with his hand. He smiled often, spoke gently, and made everyone feel valued. Studying his character is essential for every Muslim who wishes to improve themselves.',
  8, ARRAY['character', 'manners', 'Prophet''s character', 'best example', 'conduct', 'akhlaq']);

SELECT _seed_lesson('Character & Conduct', 2,
  'Truthfulness and Honesty',
  'The path of truth leads to righteousness, and righteousness leads to Paradise.',
  'The Prophet said: "Truthfulness leads to righteousness, and righteousness leads to Paradise." He urged Muslims to always speak the truth even when it is difficult. Lying, on the other hand, leads to wickedness and ultimately to the Fire. The Prophet was known as al-Amin (the Trustworthy) even before his prophethood. A Muslim''s word should be their bond.',
  5, ARRAY['truthful', 'honest', 'honesty', 'lying', 'truth', 'trustworthy', 'al-amin']);

SELECT _seed_lesson('Character & Conduct', 3,
  'Patience in Adversity',
  'Sabr — the quality that defines the believer in times of trial.',
  'The Prophet taught that patience (sabr) is a light. He said that no fatigue, illness, anxiety, sorrow, harm, or sadness befalls a Muslim — even the pricking of a thorn — except that Allah expiates some of their sins thereby. True patience is at the first stroke of calamity, not after emotions settle. The rewards for patience are given without measure on the Day of Judgment.',
  6, ARRAY['patience', 'sabr', 'patient', 'trial', 'calamity', 'affliction', 'hardship']);

SELECT _seed_lesson('Character & Conduct', 4,
  'Kindness to Parents',
  'The rights of parents in Islam — second only to the rights of Allah.',
  'After the rights of Allah, the greatest rights belong to parents. The Prophet taught that Paradise lies at the feet of the mother. He said that the pleasure of Allah is in the pleasure of parents, and the anger of Allah is in the anger of parents. Even if parents are non-Muslim, they must be treated with kindness and respect. Serving aging parents is one of the greatest deeds a Muslim can perform.',
  6, ARRAY['parents', 'mother', 'father', 'kindness to parents', 'obedience to parents', 'paradise lies at the feet']);

SELECT _seed_lesson('Character & Conduct', 5,
  'The Rights of Spouses',
  'Building a marriage on mercy, love, and mutual respect.',
  'The Prophet said: "The best of you are those who are best to their wives." He treated his wives with exceptional kindness — he would help with housework, race with Aisha, and consult them on important matters. Both spouses have rights: the husband has the right to be respected and supported, and the wife has the right to kind treatment, financial provision, and emotional care. Marriage in Islam is described as a garment — each spouse protects and covers the other.',
  7, ARRAY['wife', 'wives', 'marriage', 'spouse', 'husband', 'best to their wives', 'women']);

SELECT _seed_lesson('Character & Conduct', 6,
  'Raising Children with Prophetic Wisdom',
  'Teaching, nurturing, and disciplining children the Islamic way.',
  'The Prophet was exceptionally gentle with children. He would carry his granddaughter while praying, he kissed his grandchildren and encouraged others to show affection, and he said: "He is not one of us who does not show mercy to our young ones and respect to our old ones." Teaching children prayer by age seven, treating siblings equally, and making dua for them are key Prophetic parenting principles.',
  6, ARRAY['children', 'child', 'raising children', 'young ones', 'son', 'daughter', 'mercy to our young']);

SELECT _seed_lesson('Character & Conduct', 7,
  'Controlling Anger',
  'The true strong person is the one who controls themselves in anger.',
  'The Prophet said: "The strong person is not the one who can wrestle, but the one who controls himself when angry." He advised: when angry, remain silent; if standing, sit down; if sitting, lie down; and make wudu. Anger is from Shaytan, and water extinguishes fire. The Prophet himself never became angry for personal reasons — only when the boundaries of Allah were violated.',
  5, ARRAY['anger', 'angry', 'strong person', 'controls himself', 'calm', 'wrath']);

SELECT _seed_lesson('Character & Conduct', 8,
  'Humility and Avoiding Arrogance',
  'No one with an atom''s weight of arrogance will enter Paradise.',
  'The Prophet warned that no one with even an atom''s weight of arrogance (kibr) in their heart will enter Paradise. Arrogance is defined as rejecting the truth and looking down on people. The Prophet himself was the most humble of people — he would sit with the poor, visit the sick, accept invitations from anyone, and ride a donkey. True greatness in Islam comes through humility, not through status or wealth.',
  5, ARRAY['humility', 'humble', 'arrogance', 'pride', 'kibr', 'atom''s weight']);

SELECT _seed_lesson('Character & Conduct', 9,
  'The Tongue: Guard It',
  'Most people enter Hellfire because of their tongues.',
  'The Prophet said that whoever guarantees what is between their jaws (tongue) and what is between their legs, he guarantees Paradise for them. He warned against backbiting (gheebah), slander (buhtan), gossip, and idle speech. The tongue is the most dangerous organ — a single word can lead to Allah''s pleasure or His wrath. Speaking good or remaining silent is a sign of true faith.',
  6, ARRAY['tongue', 'speech', 'backbiting', 'gossip', 'silence', 'speak good', 'guard']);

SELECT _seed_lesson('Character & Conduct', 10,
  'Generosity and Hospitality',
  'The Prophet was more generous than the blowing wind.',
  'The Prophet was described as being more generous than the wind sent with rain. He never said "no" to anyone who asked him for something. He encouraged hosting guests, saying that whoever believes in Allah and the Last Day should honor their guest. Generosity is not limited to wealth — it includes generosity of spirit, time, knowledge, and even a warm smile.',
  5, ARRAY['generous', 'generosity', 'hospitality', 'guest', 'giving', 'spend']);

SELECT _seed_lesson('Character & Conduct', 11,
  'Justice and Fairness',
  'Standing for justice even against yourself or your loved ones.',
  'The Prophet established justice as an absolute principle. He said: "If Fatimah, the daughter of Muhammad, stole, I would cut off her hand." Justice applies equally regardless of status, wealth, or relationship. He warned against oppression (dhulm), saying that it will be darkness on the Day of Judgment. Muslims are commanded to stand as witnesses for justice even if it goes against themselves.',
  6, ARRAY['justice', 'fairness', 'just', 'oppression', 'dhulm', 'equality']);

SELECT _seed_lesson('Character & Conduct', 12,
  'Mercy and Compassion',
  'The merciful are shown mercy by the Most Merciful.',
  'The Prophet said: "The merciful are shown mercy by the Most Merciful. Be merciful to those on earth, and the One in the heavens will be merciful to you." He showed mercy to children, animals, enemies, and even those who harmed him. When he conquered Makkah, he forgave the people who had persecuted him for years. Mercy is not weakness — it is the hallmark of prophetic character.',
  5, ARRAY['mercy', 'merciful', 'compassion', 'kindness', 'gentle', 'forgive']);

SELECT _seed_lesson('Character & Conduct', 13,
  'Good Neighborly Relations',
  'Jibril kept advising about the neighbor until the Prophet thought neighbors would inherit.',
  'The Prophet said that Jibril kept advising him about the rights of neighbors until he thought neighbors would be given a share of inheritance. A good neighbor in Islam has rights: do not harm them, protect their property, share food with them, and check on them. The Prophet warned that a person who fills their stomach while their neighbor goes hungry is not a true believer.',
  5, ARRAY['neighbor', 'neighbours', 'neighborly', 'next door', 'adjacent']);

SELECT _seed_lesson('Character & Conduct', 14,
  'Modesty and Haya',
  'Modesty is a branch of faith and brings nothing but good.',
  'The Prophet said: "Modesty (haya) is a branch of faith" and "Modesty brings nothing but good." Haya encompasses modesty in dress, speech, behavior, and interaction with others. The Prophet was more modest than a virgin behind a curtain. Modesty is not shyness that prevents speaking truth — it is a dignified restraint that protects a person''s honor and the honor of others.',
  5, ARRAY['modesty', 'haya', 'modest', 'shame', 'shyness', 'branch of faith']);

SELECT _seed_lesson('Character & Conduct', 15,
  'Gratitude: Thanking Allah and People',
  'Whoever does not thank people does not thank Allah.',
  'The Prophet taught that gratitude has two dimensions: thanking Allah and thanking people. He said that whoever does not thank people does not thank Allah. Gratitude is shown through the heart (acknowledging the blessing), the tongue (praising Allah), and the limbs (using blessings in obedience to Allah). Being content with what Allah has given and comparing oneself to those with less — not more — cultivates a grateful heart.',
  5, ARRAY['gratitude', 'grateful', 'thankful', 'shukr', 'thank Allah', 'thank people']);

SELECT _seed_lesson('Character & Conduct', 16,
  'Visiting the Sick',
  'One of the rights a Muslim has over another Muslim.',
  'Visiting the sick is a right that every Muslim has over their fellow Muslim. The Prophet taught that when you visit a sick person, you are walking in the harvest of Paradise until you return. He would visit the sick, pray for them, and comfort them. The visitor should make dua for the sick person, keep the visit short, and bring hope and positive words.',
  4, ARRAY['sick', 'visiting the sick', 'illness', 'disease', 'cure', 'medicine', 'health']);

SELECT _seed_lesson('Character & Conduct', 17,
  'Respecting Elders and Scholars',
  'Honor, dignity, and reverence for those who came before.',
  'The Prophet said: "He is not one of us who does not show mercy to our young ones and respect to our elderly." The companions showed immense respect to the Prophet and to the scholars among them. Respecting elders includes lowering one''s voice, standing to greet them, making space for them, and benefiting from their wisdom. Knowledge in Islam is taken from trustworthy scholars, not from unqualified sources.',
  5, ARRAY['elders', 'elderly', 'scholars', 'respect', 'old', 'knowledge', 'honor']);

SELECT _seed_lesson('Character & Conduct', 18,
  'Dealing with Enemies and Opponents',
  'The Prophet''s response to those who opposed him — a masterclass in character.',
  'The Prophet faced extreme persecution — he was mocked, boycotted, physically assaulted, and driven from his home. Yet he never responded with revenge when he had the power to do so. When he conquered Makkah, he said to his former persecutors: "Go, for you are free." When the people of Taif pelted him with stones, he refused the angel''s offer to crush them, hoping their descendants would worship Allah. This is the highest standard of character.',
  7, ARRAY['enemy', 'enemies', 'opponent', 'persecution', 'forgave', 'forgiven', 'conquered Makkah']);

-- =============================================================
-- PATH 4: Scholars' Deep Dive (scholar, 20 lessons)
-- =============================================================

SELECT _seed_lesson('Scholars'' Deep Dive', 1,
  'Introduction to Hadith Sciences',
  'Understanding mustalah al-hadith — the methodology behind authenticating hadith.',
  'Hadith sciences (mustalah al-hadith) is the discipline through which scholars verify the authenticity of prophetic narrations. It examines the chain of narrators (isnad) and the text (matn). Key concepts include the classification of hadith as sahih (authentic), hasan (good), da''if (weak), and mawdu'' (fabricated). This rigorous methodology is unique to the Muslim ummah and has no parallel in any other civilization''s historical record-keeping.',
  10, ARRAY['hadith sciences', 'isnad', 'chain of narration', 'narrator', 'authentic', 'sahih']);

SELECT _seed_lesson('Scholars'' Deep Dive', 2,
  'Sahih al-Bukhari: The Most Authentic Book',
  'Understanding the collection, methodology, and significance of Imam al-Bukhari''s work.',
  'Imam al-Bukhari (d. 256 AH) compiled the most authentic collection of hadith. He reportedly examined 600,000 hadith and selected approximately 7,275 (including repetitions) for his Sahih. His strict conditions included requiring an established meeting between each narrator in the chain. He would pray two rak''ahs of istikhara before including each hadith. Scholars unanimously agree that Sahih al-Bukhari is the most authentic book after the Quran.',
  10, ARRAY['Bukhari', 'al-Bukhari', 'most authentic', 'sahih bukhari']);

SELECT _seed_lesson('Scholars'' Deep Dive', 3,
  'Sahih Muslim: The Sister Collection',
  'Imam Muslim''s methodology and unique contributions.',
  'Imam Muslim (d. 261 AH) compiled his Sahih as a complement to al-Bukhari''s work. His collection is praised for its superior organization — grouping all narrations of a single hadith together, making it easier to study variations. His condition was less strict than al-Bukhari''s regarding narrator meetings but equally rigorous in verifying reliability. Together, Bukhari and Muslim form "al-Sahihayn" (the two Sahihs), the gold standard of hadith literature.',
  8, ARRAY['Muslim', 'Sahih Muslim', 'imam Muslim', 'sahihayn']);

SELECT _seed_lesson('Scholars'' Deep Dive', 4,
  'The Four Sunan Collections',
  'Abu Dawud, al-Tirmidhi, al-Nasa''i, and Ibn Majah — the legal hadith.',
  'The four Sunan collections focus on hadith related to Islamic law (fiqh). Abu Dawud (d. 275 AH) compiled hadith specifically relevant to legal rulings. Al-Tirmidhi (d. 279 AH) added scholarly commentary and grading to each hadith. Al-Nasa''i (d. 303 AH) was known for his extremely strict narrator criticism. Ibn Majah (d. 273 AH) completed the "six major collections." Together with al-Bukhari and Muslim, these form the Kutub al-Sittah.',
  10, ARRAY['Abu Dawud', 'Tirmidhi', 'Nasa''i', 'Ibn Majah', 'sunan', 'kutub al-sittah']);

SELECT _seed_lesson('Scholars'' Deep Dive', 5,
  'The Science of Narrator Criticism (Jarh wa Ta''dil)',
  'How scholars evaluated the reliability of hadith transmitters.',
  'Jarh wa Ta''dil is the science of evaluating narrators — their memory, honesty, precision, and religious practice. Scholars developed detailed terminology: thiqah (trustworthy), saduq (truthful), da''if (weak), kadhdhab (liar), etc. Biographical dictionaries like Tahdhib al-Kamal contain detailed entries on thousands of narrators. This science demonstrates the extraordinary lengths scholars went to in preserving the Prophet''s legacy.',
  12, ARRAY['narrator', 'criticism', 'jarh', 'ta''dil', 'trustworthy', 'weak narrator', 'reliable']);

SELECT _seed_lesson('Scholars'' Deep Dive', 6,
  'Types of Hadith by Chain',
  'Mutawatir, Ahad, Gharib — understanding transmission paths.',
  'Hadith are classified by the number of narrators at each level of the chain. Mutawatir hadith have so many narrators that fabrication is impossible — these establish certain knowledge. Ahad hadith have fewer narrators and are further divided: mashhur (well-known), aziz (rare), and gharib (singular). Most hadith in the major collections are ahad, but their authentication through rigorous isnad criticism gives them strong reliability.',
  10, ARRAY['mutawatir', 'ahad', 'gharib', 'chain', 'narrators', 'transmission']);

SELECT _seed_lesson('Scholars'' Deep Dive', 7,
  'Grading Hadith: Sahih, Hasan, Da''if',
  'The criteria scholars use to determine a hadith''s authenticity level.',
  'A hadith is graded sahih (authentic) when it has: (1) a continuous chain, (2) all narrators are trustworthy and precise, (3) no hidden defect (''illah), and (4) no contradiction with stronger narrations (shudhudh). Hasan hadith meet most criteria but have a narrator with slightly lesser precision. Da''if hadith fail one or more conditions. Understanding these grades helps Muslims know which narrations can be used as evidence in belief and practice.',
  10, ARRAY['sahih', 'hasan', 'da''if', 'weak', 'authentic', 'grading', 'grade']);

SELECT _seed_lesson('Scholars'' Deep Dive', 8,
  'Fabricated Hadith and How to Identify Them',
  'Protecting the Sunnah from lies attributed to the Prophet.',
  'The Prophet warned: "Whoever attributes a lie to me deliberately, let him take his seat in the Hellfire." Despite this severe warning, fabrication occurred for political, sectarian, and personal reasons. Scholars identified fabricated hadith through: (1) a known liar in the chain, (2) text contradicting the Quran, (3) text contradicting established sunnah, (4) text contradicting reason or historical facts, (5) exaggerated rewards for minor deeds. Always verify hadith through reliable sources.',
  8, ARRAY['fabricated', 'mawdu', 'lie', 'forged', 'false hadith', 'whoever lies']);

SELECT _seed_lesson('Scholars'' Deep Dive', 9,
  'The Hadith Qudsi',
  'Divine words narrated through the Prophet, distinct from the Quran.',
  'Hadith Qudsi (sacred hadith) are narrations where the Prophet attributes the words to Allah, but they are not part of the Quran. They differ from the Quran in that: (1) they are not recited in prayer, (2) they are not necessarily in Allah''s exact words (but His meaning), (3) they were not transmitted through Jibril in the same manner. These hadith often contain deeply spiritual teachings about Allah''s mercy, love, and relationship with His servants.',
  7, ARRAY['qudsi', 'hadith qudsi', 'sacred', 'Allah says', 'My servant']);

SELECT _seed_lesson('Scholars'' Deep Dive', 10,
  'Abrogation in Hadith (Nasikh wa Mansukh)',
  'When later rulings replace earlier ones — understanding the timeline of revelation.',
  'Some hadith contain rulings that were later replaced by new ones. Understanding abrogation (naskh) requires knowing the chronological order of narrations. For example, the Prophet initially forbade visiting graves, then later permitted and encouraged it. Scholars use multiple methods to identify abrogation: explicit statements by the Prophet, historical context, and the actions of the companions. Misunderstanding abrogation can lead to following outdated rulings.',
  10, ARRAY['abrogation', 'abrogate', 'nasikh', 'mansukh', 'replaced', 'earlier ruling']);

SELECT _seed_lesson('Scholars'' Deep Dive', 11,
  'Understanding Context (Asbab al-Wurud)',
  'Why knowing the circumstances behind a hadith changes everything.',
  'Just as the Quran has occasions of revelation (asbab al-nuzul), hadith have circumstances of narration (asbab al-wurud). The same hadith can be misunderstood if taken out of context. For example, the Prophet''s statements to specific individuals may not apply universally. Understanding context includes knowing: who was being addressed, what prompted the statement, cultural norms of the time, and whether it was a specific or general ruling.',
  8, ARRAY['context', 'circumstances', 'occasion', 'reason for', 'background', 'asbab']);

SELECT _seed_lesson('Scholars'' Deep Dive', 12,
  'Musnad Ahmad: The Comprehensive Collection',
  'Imam Ahmad''s massive collection organized by narrator.',
  'Imam Ahmad ibn Hanbal (d. 241 AH) compiled the Musnad, one of the largest hadith collections with over 27,000 narrations. Unlike the Sahih collections, the Musnad is organized by narrator (companion) rather than topic. This makes it invaluable for studying what each companion narrated. Imam Ahmad was known for his incredible memory, his patience under persecution, and his insistence on following evidence over opinion.',
  8, ARRAY['Ahmad', 'Musnad', 'ibn Hanbal', 'Imam Ahmad']);

SELECT _seed_lesson('Scholars'' Deep Dive', 13,
  'The Muwatta of Imam Malik',
  'The earliest compiled book of hadith and fiqh combined.',
  'Imam Malik (d. 179 AH) compiled the Muwatta, one of the earliest books of hadith. It uniquely combines hadith with the practice (''amal) of the people of Madinah, whom Imam Malik considered a living chain of transmission. The Muwatta is organized by legal topics and includes hadith, companion statements (athar), and Malik''s own legal opinions. It represents the earliest attempt to codify Islamic law with its evidence.',
  8, ARRAY['Muwatta', 'Malik', 'Imam Malik', 'Madinah', 'earliest']);

SELECT _seed_lesson('Scholars'' Deep Dive', 14,
  'Cross-Collection Analysis',
  'Comparing the same hadith across multiple collections for deeper understanding.',
  'Advanced hadith study involves comparing narrations across collections. The same hadith may appear in Bukhari with one chain, Muslim with another, and Abu Dawud with additional wording. These variations (zawaid) can add details, clarify ambiguities, or strengthen the overall narration. Scholars use cross-referencing to identify the most complete version and to detect subtle errors in transmission.',
  10, ARRAY['collections', 'comparison', 'narrations', 'versions', 'wording']);

SELECT _seed_lesson('Scholars'' Deep Dive', 15,
  'The Role of Women in Hadith Transmission',
  'Female scholars who preserved prophetic knowledge throughout history.',
  'Women played a crucial role in hadith transmission. Aisha (may Allah be pleased with her) is one of the most prolific narrators, transmitting over 2,200 hadith. She corrected companions'' misunderstandings and was consulted by scholars for decades after the Prophet''s death. Fatimah bint Qays, Umm Salamah, and many other women were recognized as authorities. Throughout Islamic history, women scholars certified male scholars in hadith — something often overlooked today.',
  8, ARRAY['women', 'Aisha', 'female', 'narrator', 'woman scholar', 'Umm Salamah']);

SELECT _seed_lesson('Scholars'' Deep Dive', 16,
  'The 40 Hadith of Imam al-Nawawi',
  'The most studied collection of foundational hadith in Islamic education.',
  'Imam al-Nawawi (d. 676 AH) compiled 42 hadith that encompass the foundations of Islam. These carefully selected narrations cover creed, worship, ethics, and law. Nearly every Islamic institution worldwide uses this collection for teaching. Famous hadith in this collection include "Actions are by intentions," "Islam is built upon five pillars," and "Leave that which makes you doubt for that which does not." Studying these hadith provides a comprehensive foundation.',
  10, ARRAY['Nawawi', '40 hadith', 'forty hadith', 'actions are by intentions', 'foundations']);

SELECT _seed_lesson('Scholars'' Deep Dive', 17,
  'Contemporary Hadith Scholarship',
  'Modern scholars and their contributions to hadith verification.',
  'Hadith scholarship did not end in the medieval period. Modern scholars like al-Albani (d. 1999), who re-graded thousands of hadith in the Sunan collections, have made significant contributions. Digital tools now allow researchers to cross-reference chains of narration instantly. However, the fundamental methodology remains unchanged — the same principles developed over 1,400 years ago continue to be the standard for authenticating prophetic narrations.',
  8, ARRAY['contemporary', 'modern', 'scholars', 'verification', 'al-Albani', 'scholarship']);

SELECT _seed_lesson('Scholars'' Deep Dive', 18,
  'Common Misquoted and Misunderstood Hadith',
  'Clarifying narrations that are frequently taken out of context.',
  'Several hadith are commonly misquoted or misunderstood. "Paradise is under the feet of mothers" is a hadith with a weak chain. "Seeking knowledge is obligatory for every Muslim" is hasan but often extended with fabricated additions. "Difference of opinion in my ummah is a mercy" has no authentic chain. Learning to verify before sharing is essential in the age of social media, where unverified narrations spread rapidly.',
  8, ARRAY['misquoted', 'misunderstood', 'fabricated', 'weak', 'verify', 'common hadith']);

SELECT _seed_lesson('Scholars'' Deep Dive', 19,
  'Hadith and Islamic Law (Fiqh)',
  'How jurists derive rulings from prophetic narrations.',
  'The relationship between hadith and fiqh is fundamental. Jurists (fuqaha) derive legal rulings by examining hadith alongside the Quran, scholarly consensus (ijma''), and analogical reasoning (qiyas). Different schools of law may reach different conclusions from the same hadith based on their methodology. Understanding this process prevents rigid literalism while maintaining respect for prophetic guidance. Every ruling should be traced back to its evidence.',
  10, ARRAY['fiqh', 'Islamic law', 'ruling', 'jurisprudence', 'halal', 'haram', 'permissible']);

SELECT _seed_lesson('Scholars'' Deep Dive', 20,
  'Preserving the Sunnah: Your Responsibility',
  'Every Muslim''s role in learning, practicing, and sharing authentic hadith.',
  'The Prophet said: "May Allah brighten the face of a person who hears a hadith from us, memorizes it, and conveys it as he heard it." Preserving the Sunnah is not only for scholars — every Muslim can contribute by: learning authenticated hadith, practicing them daily, teaching them to family, sharing them accurately (with proper grading), and supporting institutions that preserve Islamic knowledge. In the age of misinformation, every authentic hadith shared is an act of service to the ummah.',
  6, ARRAY['preserve', 'sunnah', 'convey', 'memorize', 'teach', 'share', 'responsibility']);

-- =============================================================
-- Update lesson counts on learning_paths
-- =============================================================
UPDATE public.learning_paths
SET lesson_count = (
  SELECT COUNT(*) FROM public.path_lessons WHERE path_id = learning_paths.id
);

-- =============================================================
-- Drop the temporary helper function
-- =============================================================
DROP FUNCTION IF EXISTS _seed_lesson;
