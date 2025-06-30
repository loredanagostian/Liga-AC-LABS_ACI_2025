package com.aciworldwide.aclabs22.controllers;

import com.aciworldwide.aclabs22.dto.TransactionDTO;
import com.aciworldwide.aclabs22.services.AnomalyService;
import com.aciworldwide.aclabs22.entities.AnomalyModel;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/anomaly")
public class AnomalyController {

    private final AnomalyService anomalyService;

    @PostMapping
    public List<AnomalyModel> detectAnomalies(@RequestBody List<TransactionDTO> transactions) {
        return anomalyService.detectAnomalies(transactions);
    }
}
