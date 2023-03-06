import json
import os
import uuid

GENERAL_MAP_INFO = "Map Info"

readFolderString = "./SNACE/data/LogFiles022823/"
writeFolderString = readFolderString + "json/"
fileArray = os.listdir(readFolderString)

map_names=["Blizzard World", "Busan", "Circuit Royal", "Colosseo", "Dorado", 
"Eichenwalde", "Esperança", "Havana", "Hollywood", "Ilios", "Junkertown", "King's Row", 
"Lijiang Tower", "Midtown", "Nepal", "New Queen Street", "Numbani", "Oasis", "Paraíso", 
"Route 66", "Rialto", "Watchpoint: Gibraltar", "Shambali Monastery"]

koth_maps={
"Busan": { 0: "Busan Downtown", 1: "Busan Sanctuary", 2: "Busan MEKA Base" }, 
"Ilios": { 0: "Ilios Lighthouse", 1: "Ilios Well", 2: "Ilios Ruins"}, 
"Lijiang Tower": { 0: "Lijiang Night Market", 1: "Lijiang Garden", 2: "Lijiang Control Center" }, 
"Nepal": { 0: "Nepal Village", 1: "Nepal Shrine", 2: "Nepal Sanctum" }, 
"Oasis": { 0: "Oasis City Center", 1: "Oasis Gardens", 2: "Oasis University" }}

player_text=["FinalBlow","Suicide","Resurrected","DuplicatingStart","DuplicatingEnd"]
map_text=["False","True"]

dataNames = ["hero", "dmg_dealt", "barrier_dmg_dealt", "dmg_blocked", "dmg_taken", "deaths", "elims", 
             "final_blows", "enviro_deaths", "enviro_kills", "healing_dealt", "obj_kills", "solo_kills", 
             "ults_earned", "ults_used", "healing_received", "ult_charge", "player_closest_reticle", 
             "ability_1_cooldown", "ability_2_cooldown", "max_health", "altitude", "current_health"]
positionDataNames = ["pos_x", "pos_y", "pos_z"]
facingDataNames = ["facing_x", "facing_y", "facing_z"]

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

if(not os.path.isdir(writeFolderString)):
    os.mkdir(writeFolderString)

for file in list(filter(lambda f: ".txt" in f, fileArray)):

    team_one = []
    team_one_name = ""
    team_two = []
    team_two_name = ""

    info_dict = {}
    generalMapName=""
    subMapName=""

    with open(readFolderString + file, "r", encoding="utf-8") as log:
        print(file)
        
        for line in log:
            
            line = line.split("|")

            firstSection = line[1]
            if not IsNumber(firstSection):
                if firstSection.upper() in map(lambda m: m.upper(), map_names):
                    if generalMapName == "":
                        generalMapName = firstSection
                    if firstSection in koth_maps:
                        subMapName = koth_maps[firstSection][int(line[5].strip())]
                    else:
                        subMapName = firstSection
                    team_one_name = line[3]
                    team_two_name = line[4]
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

            duplicating = False
            duplicateCharacterOne = ""
            duplicateCharacterTwo = ""

            if not IsNumber(identifier):

                if str(time) not in info_dict[generalMapName][team_one_name][team_one[0]] and identifier not in map_text:
                    for player in team_one:
                        info_dict[generalMapName][team_one_name][player][str(time)] = {"death": False, 
                                                                                       "final_blow": False,
                                                                                       "self_elim": False,
                                                                                       "resurrected": False,
                                                                                       "duplicate_start": False,
                                                                                       "duplicating": duplicateCharacterOne,
                                                                                       "duplicate_end": False}
                    for player in team_two:
                        info_dict[generalMapName][team_two_name][player][str(time)] = {"death": False, 
                                                                                       "final_blow": False,
                                                                                       "self_elim": False,
                                                                                       "resurrected": False,
                                                                                       "duplicate_start": False,
                                                                                       "duplicating": duplicateCharacterTwo,
                                                                                       "duplicate_end": False}
                if not identifier.startswith("(") and identifier not in player_text and identifier not in map_text:
                    
                    teamName = line[22]
                    playerName = identifier

                    position = line[21].split(',')
                    directionFacing = line[26].split(',')

                    for i in range(3, 21):
                        info_dict[generalMapName][teamName][playerName][str(time)][dataNames[i-3]] = line[i]
                    for i in range(23, 26):
                        info_dict[generalMapName][teamName][playerName][str(time)][dataNames[i-5]] = line[i]
                    for i in range(27, 29):
                        info_dict[generalMapName][teamName][playerName][str(time)][dataNames[i-6]] = line[i]
                    for i in range(0, 2):
                        info_dict[generalMapName][teamName][playerName][str(time)][positionDataNames[i]] = position[i].strip('( ')
                        info_dict[generalMapName][teamName][playerName][str(time)][facingDataNames[i]] = directionFacing[i].strip('( ')


                elif identifier in player_text:
                    if identifier == "FinalBlow":
                        eliminatedBy = line[3]
                        playerEliminated = line[4]

                        playerEliminatedTeam = team_one_name if playerEliminated in team_one else team_two_name
                        eliminatedByTeam = team_one_name if eliminatedBy in team_one else team_two_name

                        info_dict[generalMapName][playerEliminatedTeam][playerEliminated][str(time)]['death'] = True
                        info_dict[generalMapName][eliminatedByTeam][eliminatedBy][str(time)]['final_blow'] = True
                    if identifier == "Suicide":
                        playerEliminated = line[3].split("\n")[0]
                        playerEliminatedTeam = team_one_name if playerEliminated in team_one else team_two_name

                        info_dict[generalMapName][playerEliminatedTeam][playerEliminated][str(time)]['self_elim'] = True
                        
                    if identifier == "Resurrected":
                        playerResurrected = line[3].split("\n")[0]
                        playerResurrectedTeam = team_one_name if playerResurrected in team_one else team_two_name

                        info_dict[generalMapName][playerResurrectedTeam][playerResurrected][str(time)]['resurrected'] = True
                        
                    if identifier == "DuplicatingStart":
                        playerDuplicating = line[3]
                        characterDuplicated = line[4]

                        playerDuplicatingTeam = team_one_name if playerDuplicating in team_one else team_two_name

                        if playerDuplicatingTeam == team_one_name:
                            duplicateCharacterOne = characterDuplicated
                        else:
                            duplicateCharacterTwo = characterDuplicated

                        info_dict[generalMapName][playerDuplicatingTeam][playerDuplicating][str(time)]['duplicate_start'] = True
                        info_dict[generalMapName][playerDuplicatingTeam][playerDuplicating][str(time)]['duplicating'] = characterDuplicated


                    if identifier == "DuplicatingEnd":
                        playerDuplicating = line[3].split("\n")[0]

                        playerDuplicatingTeam = team_one_name if playerDuplicating in team_one else team_two_name

                        if playerDuplicatingTeam == team_one_name:
                            duplicateCharacterOne = ""
                        else:
                            duplicateCharacterTwo = ""

                        info_dict[generalMapName][playerDuplicatingTeam][playerDuplicating][str(time)]['duplicate_end'] = True
                        info_dict[generalMapName][playerDuplicatingTeam][playerDuplicating][str(time)]['duplicating'] = ""


        with open(writeFolderString + str(uuid.uuid4()) + "-" + team_one_name + "-" + team_two_name + ".json", "w", encoding="utf-8") as output:
            json.dump(info_dict, output)
 