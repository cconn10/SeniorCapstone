import json
import os

GENERAL_MAP_INFO = "Map Info"

readFolderString = "./SNACE/data/LogFiles012323/"
writeFolderString = readFolderString + "json2/"
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

    team_one = []
    team_one_name = ""
    team_two = []
    team_two_name = ""

    info_dict = {}
    generalMapName=""

    with open(readFolderString + file, "r", encoding="utf-8") as log:
        print(file)
        
        for line in log:
            
            line = line.split("|")

            firstSection = line[1]
            if not IsNumber(firstSection):
                if len(team_one) == 0:
                    if firstSection.upper() in map(lambda m: m.upper() ,map_names):
                        if generalMapName == "":
                            if firstSection in koth_maps:
                                generalMapName = koth_maps[firstSection][int(line[4].strip())]
                            else:
                                generalMapName = firstSection
                            team_one_name = line[2]
                            team_two_name = line[3]
                            info_dict[generalMapName] = {}
                            info_dict[generalMapName][team_one_name] = {}
                            info_dict[generalMapName][team_two_name] = {}
                    else:
                        team_one = [line[1], line[2], line[3], line[4], line[5]]
                        team_two = [line[6], line[7], line[8], line[9], line[10].split("\n")[0]]
                        
                        for player in team_one:
                            info_dict[generalMapName][team_one_name][player] = {}
                        for player in team_two:
                            info_dict[generalMapName][team_two_name][player] = {}
                continue
                        
            identifier = line[2].strip() 
            time = line[0].strip('[] ')


            if not IsNumber(identifier):

                if str(time) not in info_dict[generalMapName][team_one_name][team_one[0]] and identifier not in map_text:
                    for player in team_one:
                        info_dict[generalMapName][team_one_name][player][str(time)] = {"death": False, "final_blow": False}
                    for player in team_two:
                        info_dict[generalMapName][team_two_name][player][str(time)] = {"death": False, "final_blow": False}

                if not identifier.startswith("(") and identifier not in player_text and identifier not in map_text:
                    
                    teamName = line[22]
                    playerName = identifier

                    position = line[21].split(',')
                    directionFacing = line[26].split(',')

                    info_dict[generalMapName][teamName][playerName][str(time)]["hero"] = line[3]
                    info_dict[generalMapName][teamName][playerName][str(time)]["dmg_dealt"] = line[4]
                    info_dict[generalMapName][teamName][playerName][str(time)]["barrier_dmg_dealt"] = line[5]
                    info_dict[generalMapName][teamName][playerName][str(time)]["dmg_blocked"] = line[6]
                    info_dict[generalMapName][teamName][playerName][str(time)]["dmg_taken"] = line[7]
                    info_dict[generalMapName][teamName][playerName][str(time)]["deaths"] = line[8]
                    info_dict[generalMapName][teamName][playerName][str(time)]["elims"] = line[9]
                    info_dict[generalMapName][teamName][playerName][str(time)]["final_blows"] = line[10]
                    info_dict[generalMapName][teamName][playerName][str(time)]["enviro_deaths"] = line[11]
                    info_dict[generalMapName][teamName][playerName][str(time)]["enviro_kills"] = line[12]
                    info_dict[generalMapName][teamName][playerName][str(time)]["healing_dealt"] = line[13]
                    info_dict[generalMapName][teamName][playerName][str(time)]["obj_kills"] = line[14]
                    info_dict[generalMapName][teamName][playerName][str(time)]["solo_kills"] = line[15]
                    info_dict[generalMapName][teamName][playerName][str(time)]["ults_earned"] = line[16]
                    info_dict[generalMapName][teamName][playerName][str(time)]["ults_used"] = line[17]
                    info_dict[generalMapName][teamName][playerName][str(time)]["healing_received"] = line[18]
                    info_dict[generalMapName][teamName][playerName][str(time)]["ult_charge"] = line[19]
                    info_dict[generalMapName][teamName][playerName][str(time)]["player_closest_reticle"] = line[20]
                    info_dict[generalMapName][teamName][playerName][str(time)]["ability_1_cooldown"] = line[23]
                    info_dict[generalMapName][teamName][playerName][str(time)]["ability_2_cooldown"] = line[24]
                    info_dict[generalMapName][teamName][playerName][str(time)]["max_health"] = line[25]
                    info_dict[generalMapName][teamName][playerName][str(time)]["pos_x"] = position[0].strip('( ')
                    info_dict[generalMapName][teamName][playerName][str(time)]["pos_y"] = position[1].strip()
                    info_dict[generalMapName][teamName][playerName][str(time)]["pos_z"] = position[2].strip(') ')
                    info_dict[generalMapName][teamName][playerName][str(time)]["facing_x"] = directionFacing[0].strip('( ')
                    info_dict[generalMapName][teamName][playerName][str(time)]["facing_y"] = directionFacing[1].strip()
                    info_dict[generalMapName][teamName][playerName][str(time)]["facing_z"] = directionFacing[2].strip(')\n')


                elif identifier in player_text:
                    if identifier == "FinalBlow":
                        eliminatedBy = line[3]
                        playerEliminated = line[4]

                        playerEliminatedTeam = team_one_name if playerEliminated in team_one else team_two_name
                        eliminatedByTeam = team_one_name if eliminatedBy in team_one else team_two_name

                        info_dict[generalMapName][playerEliminatedTeam][playerEliminated][str(time)]['death'] = True
                        info_dict[generalMapName][eliminatedByTeam][eliminatedBy][str(time)]['final_blow'] = True
                    if identifier == "Suicide":
                        continue
                    if identifier == "Resurrected":
                        continue
                    if identifier == "DuplicatingStart":
                        continue
                    if identifier == "DuplicatingEnd":
                        continue


        with open(writeFolderString + getFileMapName(generalMapName) + "_Log.json", "w", encoding="utf-8") as output:
            json.dump(info_dict, output)
 