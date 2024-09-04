#!/bin/bash

npm run worker:get-route-price > /home/ubuntu/get_route_price 2>&1 &
npm run worker:save-route-price > /home/ubuntu/save_route_price 2>&1 &
npm run worker:send-notification > /home/ubuntu/send_notification 2>&1 &