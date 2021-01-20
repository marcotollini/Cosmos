CREATE OR REPLACE FUNCTION compute_latest_snapshot_trigger_event_init()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    PERFORM compute_latest_snapshot('event_init');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION compute_latest_snapshot_trigger_event_log_init()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    PERFORM compute_latest_snapshot('event_log_init');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION compute_latest_snapshot_trigger_event_peer_down()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    PERFORM compute_latest_snapshot('event_peer_down');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION compute_latest_snapshot_trigger_event_peer_up()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    PERFORM compute_latest_snapshot('event_peer_up');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION compute_latest_snapshot_trigger_event_route_monitor()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    PERFORM compute_latest_snapshot('event_route_monitor');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION compute_latest_snapshot_trigger_event_stats()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    PERFORM compute_latest_snapshot('event_stats');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION compute_latest_snapshot_trigger_event_log_close()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    PERFORM compute_latest_snapshot('event_log_close');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION compute_latest_snapshot_trigger_event_term()
RETURNS trigger
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    PERFORM compute_latest_snapshot('event_term');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_snapshot_init
AFTER INSERT ON event_init
FOR EACH ROW
WHEN (NEW.id_init % 5000 = 0)
EXECUTE PROCEDURE compute_latest_snapshot_trigger_event_init();

CREATE TRIGGER trigger_snapshot_log_init
AFTER INSERT ON event_log_init
FOR EACH ROW
WHEN (NEW.id_log_init % 5000 = 0)
EXECUTE PROCEDURE compute_latest_snapshot_trigger_event_log_init();

CREATE TRIGGER trigger_snapshot_peer_down
AFTER INSERT ON event_peer_down
FOR EACH ROW
WHEN (NEW.id_peer_down % 5000 = 0)
EXECUTE PROCEDURE compute_latest_snapshot_trigger_event_peer_down();

CREATE TRIGGER trigger_snapshot_peer_up
AFTER INSERT ON event_peer_up
FOR EACH ROW
WHEN (NEW.id_peer_up % 5000 = 0)
EXECUTE PROCEDURE compute_latest_snapshot_trigger_event_peer_up();

CREATE TRIGGER trigger_snapshot_route_monitor
AFTER INSERT ON event_route_monitor
FOR EACH ROW
WHEN (NEW.id_route_monitor % 100000 = 0)
EXECUTE PROCEDURE compute_latest_snapshot_trigger_event_route_monitor();

CREATE TRIGGER trigger_snapshot_stats
AFTER INSERT ON event_stats
FOR EACH ROW
WHEN (NEW.id_stats % 500000 = 0)
EXECUTE PROCEDURE compute_latest_snapshot_trigger_event_stats();

CREATE TRIGGER trigger_snapshot_log_close
AFTER INSERT ON event_log_close
FOR EACH ROW
WHEN (NEW.id_log_close % 5000 = 0)
EXECUTE PROCEDURE compute_latest_snapshot_trigger_event_log_close();

CREATE TRIGGER trigger_snapshot_term
AFTER INSERT ON event_term
FOR EACH ROW
WHEN (NEW.id_term % 5000 = 0)
EXECUTE PROCEDURE compute_latest_snapshot_trigger_event_term();
