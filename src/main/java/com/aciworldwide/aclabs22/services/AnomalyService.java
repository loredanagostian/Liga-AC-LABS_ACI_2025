package com.aciworldwide.aclabs22.services;

import com.aciworldwide.aclabs22.dto.TransactionDTO;
import com.aciworldwide.aclabs22.entities.AnomalyModel;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Log4j2
@Service
public class AnomalyService {

    public List<AnomalyModel> detectAnomalies(List<TransactionDTO> transactions) {
        log.info("Starting anomaly detection for {} transactions", transactions.size());

        List<AnomalyModel> anomalies = new ArrayList<>();

        for (TransactionDTO t : transactions) {
            LocalDateTime timestamp = convertTimestampToLocalDateTime(t.getTimestamp());
            List<String> reasons = getAnomalyReasons(t.getAmount(), timestamp, t.getCardNumber(), transactions);

            if (!reasons.isEmpty()) {
                AnomalyModel anomaly = new AnomalyModel();
                anomaly.setCardNumber(t.getCardNumber());
                anomaly.setAmount(t.getAmount());
                anomaly.setTimestamp(t.getTimestamp());
                anomaly.setReason(String.join("; ", reasons));

                anomalies.add(anomaly);
                log.info("Anomaly detected: {} - {}", anomaly.getCardNumber(), anomaly.getReason());
            }
        }

        log.info("Anomaly detection finished, found {} anomalies", anomalies.size());
        return anomalies;
    }

    private LocalDateTime convertTimestampToLocalDateTime(Timestamp timestamp) {
        return timestamp != null ? timestamp.toLocalDateTime() : null;
    }

    private List<String> getAnomalyReasons(Double amount, LocalDateTime timestamp, String cardNumber, List<TransactionDTO> allTx) {
        List<String> reasons = new ArrayList<>();
        if (amount == null || timestamp == null || cardNumber == null) return reasons;

        int hour = timestamp.getHour();

        // 1. Large amount
        if (amount > 5000) {
            reasons.add("Large amount > 5000");
        }

        // 2. Suspicious time + moderately large amount
        if ((hour >= 23 || hour < 6) && amount > 2000) {
            reasons.add("Suspicious time (23:00–06:00) with amount > 2000");
        }

        // 3. Many transactions for same card in <1 minute
        long quickTxCount = allTx.stream()
                .filter(tx -> cardNumber.equals(tx.getCardNumber()))
                .filter(tx -> {
                    LocalDateTime txTime = convertTimestampToLocalDateTime(tx.getTimestamp());
                    return txTime != null && Math.abs(timestamp.minusSeconds(60).until(txTime, java.time.temporal.ChronoUnit.SECONDS)) <= 60;
                })
                .count();
        if (quickTxCount > 3) {
            reasons.add("More than 3 transactions in under 1 minute");
        }

        // 4. Repeated identical amounts in short time
        long repeatedAmountCount = allTx.stream()
                .filter(tx -> cardNumber.equals(tx.getCardNumber()))
                .filter(tx -> tx.getAmount().equals(amount))
                .filter(tx -> {
                    LocalDateTime txTime = convertTimestampToLocalDateTime(tx.getTimestamp());
                    return txTime != null && Math.abs(timestamp.minusMinutes(5).until(txTime, java.time.temporal.ChronoUnit.MINUTES)) <= 5;
                })
                .count();
        if (repeatedAmountCount > 2) {
            reasons.add("Repeated identical amount within 5 minutes");
        }

        return reasons;
    }
}
