TIME=120
CLIENTS=(1 8 16 32)
TESTS=(1 50 100 200 400 800)
PGPASSWORD=postgres

DOCKER_CMD="docker run -it -e PGPASSWORD=${PGPASSWORD} --rm -v ${PWD}:/datasets/ -w /output"
PGBENCH="pgbench --host=a8b4e008d16864c209d39080df978873-1483097086.eu-central-1.elb.amazonaws.com --port=5432 --username=postgres --no-vacuum  --protocol=simple --jobs=1 --progress=1"

$DOCKER_CMD postgres:12 $PGBENCH --client=1 -t 1 -f /datasets/test_insert_cleanup.sql
sleep 10
for CLIENT in ${CLIENTS[@]}; do
    for TEST in ${TESTS[@]}; do
        OUTPUT=$PWD/local/insert/ins_$TEST/clients_$CLIENT/
        echo $OUTPUT
        mkdir -p $OUTPUT
        $DOCKER_CMD -v $OUTPUT:/output postgres:12 $PGBENCH --client=$CLIENT --log -T $TIME -f /datasets/test_insert_${TEST}.sql postgres | tee $OUTPUT/stdout.txt
        $DOCKER_CMD postgres:12 $PGBENCH --client=1 -t 1 -f /datasets/test_insert_cleanup.sql
        echo "going to sleep"
        sleep 10
    done
done

for CLIENT in ${CLIENTS[@]}; do
    OUTPUT=$PWD/local/distinct/clients_$CLIENT/
    echo $OUTPUT
    mkdir -p $OUTPUT
    $DOCKER_CMD -v $OUTPUT:/output postgres:12 $PGBENCH  --client=$CLIENT --log -T $TIME -f /datasets/test_count.sql l3visualization | tee $OUTPUT/stdout.txt
    echo "going to sleep"
    sleep 10
done

for CLIENT in ${CLIENTS[@]}; do
    OUTPUT=$PWD/local/bmp_state/clients_$CLIENT/
    echo $OUTPUT
    mkdir -p $OUTPUT
    $DOCKER_CMD -v $OUTPUT:/output postgres:12 $PGBENCH  --client=$CLIENT --log -T $TIME -f /datasets/test_bmp_state.sql l3visualization | tee $OUTPUT/stdout.txt
    echo "going to sleep"
    sleep 10
done

for CLIENT in ${CLIENTS[@]}; do
    OUTPUT=$PWD/local/count/clients_$CLIENT/
    echo $OUTPUT
    mkdir -p $OUTPUT
    $DOCKER_CMD -v $OUTPUT:/output postgres:12 $PGBENCH  --client=$CLIENT --log -T $TIME -f /datasets/test_count.sql l3visualization | tee $OUTPUT/stdout.txt
    echo "going to sleep"
    sleep 10
done
