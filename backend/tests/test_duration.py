"""
Duration parsing must be exact where it claims to be exact -- a wrong
'parsed' value is worse than an honest estimate, because the UI presents
it without a tilde.
"""
from app.modules.catalog.duration import (
    Duration,
    DurationSource,
    parse_workload,
)


class TestParsing:
    def test_plain_hours(self):
        d = parse_workload("2 hours")
        assert d and d.hours == 2.0 and d.is_exact

    def test_case_insensitive(self):
        assert parse_workload("1 Hour").hours == 1.0

    def test_decimal_hours(self):
        assert parse_workload("1.5 hours").hours == 1.5

    def test_minutes_convert(self):
        assert parse_workload("90 minutes").hours == 1.5
        assert parse_workload("45 minutes").hours == 0.75

    def test_multilingual(self):
        # the catalog is not English-only
        assert parse_workload("2 heures").hours == 2.0
        assert parse_workload("2 horas").hours == 2.0

    def test_weeks_of_study_uses_midpoint(self):
        # "4 weeks of study, 2-3 hours/week" -> 4 * 2.5 = 10
        assert parse_workload("4 weeks of study, 2-3 hours/week").hours == 10.0

    def test_weeks_single_rate(self):
        assert parse_workload("3 weeks of study, 4 hours/week").hours == 12.0

    def test_weeks_pattern_wins_over_bare_hours(self):
        # must not match the "/week" number as a total
        d = parse_workload("6 weeks of study, 2-4 hours/week")
        assert d.hours == 18.0


class TestRejection:
    def test_none_and_empty(self):
        assert parse_workload(None) is None
        assert parse_workload("") is None

    def test_unparseable(self):
        assert parse_workload("self-paced") is None

    def test_out_of_range_rejected(self):
        # nonsense is dropped, never propagated as fact
        assert parse_workload("9000 hours") is None
        assert parse_workload("0.01 hours") is None


class TestHonesty:
    def test_parsed_renders_without_tilde(self):
        assert parse_workload("18 hours").display() == "18h"

    def test_estimate_renders_as_a_range(self):
        shown = Duration.estimated(4.0).display()
        assert shown.startswith("~") and "-" in shown

    def test_estimate_is_not_exact(self):
        assert not Duration.estimated(4.0).is_exact
        assert Duration.estimated(4.0).source is DurationSource.ESTIMATED

    def test_fallback_band_is_wide(self):
        f = Duration.fallback()
        assert f.source is DurationSource.FALLBACK
        assert f.high - f.low >= 8.0
