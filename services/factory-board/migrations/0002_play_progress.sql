CREATE TABLE play_progress(
 player_id TEXT NOT NULL REFERENCES players(id),
 game TEXT NOT NULL CHECK(game IN ('robot','commands','depot','sorting','factory')),
 task TEXT NOT NULL,
 evidence TEXT NOT NULL,
 completed_at INTEGER NOT NULL,
 PRIMARY KEY(player_id,game,task)
);
INSERT INTO play_progress(player_id,game,task,evidence,completed_at)
SELECT player_id,'factory','classic-'||shift,record,unixepoch()
FROM scores WHERE (shift='steady' AND on_time=6) OR (shift='burst' AND on_time=5);
