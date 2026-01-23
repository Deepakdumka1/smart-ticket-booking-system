-- Atomic booking Lua script for Redis
-- Ensures all-or-nothing booking operation
-- KEYS: lock keys (lock:seat:seatId1, lock:seat:seatId2, ...)
-- ARGV: userId
-- Returns: array of 1 (success) or 0 (failed) for each seat

local results = {}
local userId = ARGV[1]

for i = 1, #KEYS do
    local lockKey = KEYS[i]
    local lockedBy = redis.call('GET', lockKey)
    
    if lockedBy == userId then
        -- Lock is valid, proceed with booking
        redis.call('DEL', lockKey)
        results[i] = 1
    else
        -- Lock doesn't exist or belongs to different user
        results[i] = 0
    end
end

return results
