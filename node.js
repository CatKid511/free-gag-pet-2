local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")

-- Your Vercel endpoint:
local CLAIM_API = "https://free-gag-pet-2.vercel.app/api/claim"

-- Reference folders in ServerStorage
local PetsFolder = ServerStorage:FindFirstChild("Pets")
local SeedsFolder = ServerStorage:FindFirstChild("Seeds")

-- List of valid seeds and pets (update as you add more!)
local validSeeds = {
    ["Bone Blossom"] = true,
    ["Maple Resin"] = true,
    ["Wispwing"] = true,
    ["Elephant Ears"] = true,
    ["Beanstalk"] = true,
    ["Ember Lily"] = true,
    ["Sugar Apple"] = true,
    ["Burning Bud"] = true,
    ["Giant Pinecone"] = true,
    ["CocoMango"] = true,
    ["Tranquil Bloom"] = true
}
local validPets = {
    ["Dragonfly"] = true,
    ["Raccoon"] = true,
    ["Queen Bee"] = true,
    ["Mimic Octopus"] = true,
    ["Kitsune"] = true,
    ["Fennec Fox"] = true,
    ["Disco Bee"] = true,
    ["Butterfly"] = true
}

-- Give seed to player (NOT plant)
function GivePlayerSeed(player, seedName)
    if not SeedsFolder then
        warn("Seeds folder missing!")
        return
    end
    local seedObj = SeedsFolder:FindFirstChild(seedName)
    if seedObj then
        local clone = seedObj:Clone()
        clone.Parent = player.Backpack
        print("Gave seed:", seedName, "to", player.Name)
    else
        warn("Seed object not found:", seedName)
    end
end

-- Give pet to player
function GivePlayerPet(player, petName)
    if not PetsFolder then
        warn("Pets folder missing!")
        return
    end
    local petObj = PetsFolder:FindFirstChild(petName)
    if petObj then
        local clone = petObj:Clone()
        clone.Parent = player.Backpack
        print("Gave pet:", petName, "to", player.Name)
    else
        warn("Pet object not found:", petName)
    end
end

Players.PlayerAdded:Connect(function(player)
    -- Poll claim API instantly
    local url = CLAIM_API .. "?username=" .. HttpService:UrlEncode(player.Name)
    local success, response = pcall(function()
        return HttpService:GetAsync(url)
    end)
    if success then
        local data = HttpService:JSONDecode(response)
        if data and data.success and data.item then
            local itemName = tostring(data.item)
            if validSeeds[itemName] then
                GivePlayerSeed(player, itemName)
            elseif validPets[itemName] then
                GivePlayerPet(player, itemName)
            else
                warn("Unknown item claimed:", itemName)
            end
            -- Notify player (customize for your UI, or remove this line)
            player:Kick("You received: " .. itemName .. " (join again to play!)")
        end
    else
        warn("Claim API failed for", player.Name, response)
    end
end)
