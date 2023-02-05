import json
import os

GENERAL_MAP_INFO = "Map Info"

readFolderString = "../LogFiles012323/"
writeFolderString = readFolderString + "JSON/"
fileArray = os.listdir(readFolderString)

map_names=["Blizzard World", "Busan", "Circuit Royal", "Colosseo", "Dorado", 
"Eichenwalde", "Esperança", "Havana", "Hollywood", "Ilios", "Junkertown", "King's Row", 
"Lijiang", "Midtown", "Nepal", "New Queen Street", "Numbani", "Oasis", "Paraíso", 
"Route 66", "Rialto", "Watchpoint: Gibraltar", "Shambali Monastery"]

koth_maps={
"Busan": { 0: "Busan Downtown", 1: "Busan Sanctuary", 2: "Busan MEKA Base" }, 
"Ilios": { 0: "Ilios Lighthouse", 1: "Ilios Well", 2: "Ilios Ruins"}, 
"Lijiang": { 0: "Lijiang Night Market", 1: "Lijiang Garden", 2: "Lijiang Control Center" }, 
"Nepal": { 0: "Nepal Village", 1: "Nepal Shrine", 2: "Nepal Sanctum" }, 
"Oasis": { 0: "Oasis City Center", 1: "Oasis Gardens", 2: "Oasis University" }}

player_text=["FinalBlow","Suicide","Resurrected","DuplicatingStart","DuplicatingEnd"]
map_text=["False","True"]

def IsNumber(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

def getFileMapName(s):
    s = s.replace("'","")
    s = s.replace(" ","_")

    return s

        
os.mkdir(writeFolderString)

for file in list(filter(lambda f: ".txt" in f, fileArray)):

    info_dict = {}
    generalMapName=""

    with open(readFolderString + file, "r", encoding="utf-8") as log:

        print(file)

        for line in log:
            
            line = line.split("|")

            firstSection = line[1]
            if not IsNumber(firstSection):
                if firstSection.upper() not in map(lambda m: m.upper() ,map_names):
                    continue
                else:
                    if generalMapName == "":
                        if firstSection in koth_maps:
                            generalMapName = koth_maps[firstSection][int(line[4].strip())]
                        else:
                            generalMapName = firstSection
                        info_dict[generalMapName] = {}
                        info_dict[generalMapName][line[2]] = {}
                        info_dict[generalMapName][line[3]] = {}
                continue
                        
            identifier = line[2].strip() 
            time = line[0].strip('[] ')

            if not IsNumber(identifier):
                if not identifier.startswith("(") and identifier not in player_text and identifier not in map_text:
                    
                    teamName = line[22]
                    playerName = identifier

                    if playerName not in info_dict[generalMapName][teamName]:
                        info_dict[generalMapName][teamName][playerName] = {}

                    position = line[21].split(',')
                    directionFacing = line[26].split(',')
                    info_dict[generalMapName][teamName][playerName][str(time)] =  {
                        "hero": line[3],
                        "dmg_dealt": line[4],
                        "barrier_dmg_dealt": line[5],
                        "dmg_blocked": line[6],
                        "dmg_taken": line[7],
                        "deaths": line[8],
                        "elims": line[9],
                        "final_blows": line[10],
                        "enviro_deaths": line[11],
                        "enviro_kills": line[12],
                        "healing_dealt": line[13],
                        "obj_kills": line[14],
                        "solo_kills": line[15],
                        "ults_earned": line[16],
                        "ults_used": line[17],
                        "healing_received": line[18],
                        "ult_charge": line[19],
                        "player_closest_reticle": line[20],
                        "ability_1_cooldown": line[23],
                        "ability_2_cooldown": line[24],
                        "max_health": line[25],
                        "pos_x": position[0].strip('( '), 
                        "pos_y": position[1].strip(), 
                        "pos_z": position[2].strip(') '),
                        "facing_x": position[0].strip('( '), 
                        "facing_y": position[1].strip(), 
                        "facing_z": position[2].strip(') ')}
                elif identifier in player_text:
                    if identifier == "FinalBlow":
                        info_dict[generalMapName][GENERAL_MAP_INFO][str(time)] = {
                            
                        }
                    if identifier == "Suicide":
                        info_dict[generalMapName][GENERAL_MAP_INFO][str(time)] = {
                            
                        }
                    if identifier == "Resurrected":
                        info_dict[generalMapName][GENERAL_MAP_INFO][str(time)] = {
                            
                        }
                    if identifier == "DuplicatingStart":
                        info_dict[generalMapName][GENERAL_MAP_INFO][str(time)] = {
                            
                        }
                    if identifier == "DuplicatingEnd":
                        info_dict[generalMapName][GENERAL_MAP_INFO][str(time)] = {
                            
                        }


        with open(writeFolderString + getFileMapName(generalMapName) + "_Log.json", "w", encoding="utf-8") as output:
            json.dump(info_dict, output)
 